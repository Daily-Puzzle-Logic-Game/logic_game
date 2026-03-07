const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
