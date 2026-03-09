const bcrypt = require('bcryptjs');

exports.emailSignup = async (req, res) => {
    try {
        const { email, password, name, localData } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        let user = await prisma.user.findUnique({ where: { email } });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || '',
                picture: '',
                stats: { create: {} }
            },
            include: { stats: true }
        });

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

        const sessionToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'super_secret_dev_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Signup successful',
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
        console.error('Signup Error:', error);
        res.status(500).json({ message: error.message || 'Server error during signup' });
    }
};

exports.emailLogin = async (req, res) => {
    try {
        const { email, password, localData } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        let user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        if (!user.password) {
             return res.status(400).json({ message: 'User created via social login. Please login using that provider.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

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

        const sessionToken = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET || 'super_secret_dev_key',
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Login successful',
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
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message || 'Server error during login' });
    }
};
