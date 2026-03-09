const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// In-memory store for pending Truecaller Web SDK sessions (nonce -> session data)
// Each entry is cleaned up on retrieval or after 5 minutes to prevent memory leaks.
const pendingSessions = new Map();
const TC_SESSION_TTL_MS = 5 * 60 * 1000; // 5 minutes

const TRUECALLER_PROFILE_URL = 'https://profile.truecaller.com/v1/default';

// Periodically purge sessions that were never retrieved (e.g. user abandoned the flow).
setInterval(() => {
    const now = Date.now();
    for (const [key, val] of pendingSessions.entries()) {
        if (now - val.createdAt > TC_SESSION_TTL_MS) {
            pendingSessions.delete(key);
        }
    }
}, TC_SESSION_TTL_MS);

/**
 * Verifies a Google JWT token and returns user details.
 */
const verifyGoogleToken = async (token) => {
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        return ticket.getPayload();
    } catch (error) {
        throw new Error('Invalid Google Token');
    }
};

/**
 * Handles Google Login: Registration & Guest DB Syncing
 */
exports.googleLogin = async (req, res) => {
    try {
        const { token, localData } = req.body;
        if (!token) return res.status(400).json({ message: 'Token is required' });

        // 1. Verify Google
        const payload = await verifyGoogleToken(token);
        const { email, name, picture } = payload;

        if (!email) {
            return res.status(400).json({ message: 'Email scope required.' });
        }

        // 2. Find or Create User
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    picture,
                    stats: { create: {} }
                },
                include: { stats: true }
            });
        } else {
            // Update profile pics if changed
            user = await prisma.user.update({
                where: { email },
                data: { name, picture },
                include: { stats: true }
            });
        }

        // 3. Merge Local Guest Data (If Provided)
        if (localData && localData.streakCount) {
            // If local streak > DB streak, update DB
            if (localData.streakCount > user.streakCount) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        streakCount: parseInt(localData.streakCount),
                        lastPlayed: new Date()
                    },
                    include: { stats: true }
                });
            }
        }

        // 4. Generate internal JWT session
        const sessionToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'super_secret_dev_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Authentication successful',
            token: sessionToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                streakCount: user.streakCount,
                lastPlayed: user.lastPlayed
            }
        });

    } catch (error) {
        console.error('Auth Error:', error);
        res.status(500).json({ message: error.message || 'Server error during authentication' });
    }
};

/**
 * Handles Truecaller Login Payload parsing
 */
exports.truecallerLogin = async (req, res) => {
    try {
        const { payload, signature, signatureAlgorithm, localData } = req.body;
        // In a real production app, verify the signature using Truecaller public keys:
        // const isValid = verifyTruecallerSignature(payload, signature, signatureAlgorithm);

        if (!payload) {
            return res.status(400).json({ message: 'Payload is required.' });
        }

        // Decode base64 payload
        const decodedPayload = Buffer.from(payload, 'base64').toString('utf8');
        const profile = JSON.parse(decodedPayload);

        // Profiles from truecaller usually have phoneNumbers[0] and names
        const phone = profile.phoneNumbers?.[0] || profile.id;
        const name = profile.name?.first + ' ' + (profile.name?.last || '');
        const picture = profile.avatarUrl;

        // Use a generated dummy email for Postgres schema constraint until user adds one
        const email = profile.emails?.[0] || `${phone}@truecaller.auth`;

        // 2. Find or Create User
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email,
                    name,
                    picture,
                    stats: { create: {} }
                },
                include: { stats: true }
            });
        }

        // 3. Merge Local Guest Data
        if (localData && localData.streakCount) {
            if (localData.streakCount > user.streakCount) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        streakCount: parseInt(localData.streakCount),
                        lastPlayed: new Date()
                    },
                    include: { stats: true }
                });
            }
        }

        // 4. Session JWT
        const sessionToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'super_secret_dev_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Truecaller Authentication successful',
            token: sessionToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                streakCount: user.streakCount,
            }
        });

    } catch (error) {
        console.error('Truecaller Error:', error);
        res.status(500).json({ message: 'Truecaller login failed' });
    }
};

/**
 * Handles the Truecaller Web SDK OAuth callback.
 * Truecaller GET-redirects to this endpoint with ?requestId=<nonce>&accessToken=<token>
 * after the user approves 1-tap verification on their Android device.
 *
 * GET /api/auth/truecaller/callback
 */
exports.truecallerCallback = async (req, res) => {
    try {
        const { requestId, accessToken } = req.query;

        if (!requestId || !accessToken) {
            return res.status(400).json({ message: 'requestId and accessToken are required.' });
        }

        // Verify the accessToken with Truecaller's Profile API to get user details.
        const profileRes = await fetch(`${TRUECALLER_PROFILE_URL}?alt=json`, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });

        if (!profileRes.ok) {
            console.error('Truecaller Profile API error:', profileRes.status, await profileRes.text());
            return res.status(401).json({ message: 'Invalid Truecaller access token.' });
        }

        const profile = await profileRes.json();

        const phone = profile.phoneNumbers?.[0] || profile.id || '';
        const firstName = profile.name?.first || '';
        const lastName = profile.name?.last || '';
        const name = `${firstName} ${lastName}`.trim() || phone;
        const picture = profile.avatarUrl || null;
        const email = profile.onlineIdentities?.email || profile.emails?.[0] || `${phone}@truecaller.auth`;

        // Find or create the user in the database.
        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            user = await prisma.user.create({
                data: { email, name, picture, stats: { create: {} } },
                include: { stats: true }
            });
        } else {
            user = await prisma.user.update({
                where: { email },
                data: { name, picture },
                include: { stats: true }
            });
        }

        // Generate an internal JWT session.
        const sessionToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'super_secret_dev_key',
            { expiresIn: '7d' }
        );

        // Store the completed session keyed by the nonce so the frontend can poll for it.
        pendingSessions.set(requestId, {
            token: sessionToken,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
                streakCount: user.streakCount,
            },
            createdAt: Date.now()
        });

        // Redirect back to the frontend; the polling endpoint will deliver the token.
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        return res.redirect(`${frontendUrl}?tc_auth=success`);

    } catch (error) {
        console.error('Truecaller Callback Error:', error);
        res.status(500).json({ message: 'Truecaller callback failed' });
    }
};

/**
 * Frontend polls this endpoint to retrieve the completed Truecaller session.
 * Returns 404 while pending, 200 with token once the callback has been processed.
 *
 * GET /api/auth/truecaller/session/:requestId
 */
exports.truecallerSession = async (req, res) => {
    const { requestId } = req.params;

    if (!requestId) {
        return res.status(400).json({ message: 'requestId is required.' });
    }

    const session = pendingSessions.get(requestId);
    if (!session) {
        return res.status(404).json({ status: 'pending', message: 'Session not ready yet.' });
    }

    // Deliver once and remove from store.
    pendingSessions.delete(requestId);

    return res.status(200).json({
        status: 'complete',
        message: 'Truecaller Authentication successful',
        token: session.token,
        user: session.user
    });
};
