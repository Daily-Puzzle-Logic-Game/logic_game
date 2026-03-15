const prisma = require('../config/prisma');

/**
 * POST /api/journey/complete
 * Increments the user's journey level and awards XP.
 */
exports.completeJourneyLevel = async (req, res) => {
    try {
        const userId = req.user.id;
        const { levelSolved } = req.body;

        if (!levelSolved) {
            return res.status(400).json({ message: 'levelSolved is required' });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Only increment if they solved their current level
        let newLevel = user.journeyLevel;
        if (levelSolved === user.journeyLevel) {
            newLevel = user.journeyLevel + 1;
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                journeyLevel: newLevel,
                totalPoints: { increment: 50 } // Journey levels give 50 points
            }
        });

        res.status(200).json({
            message: 'Journey progress updated',
            journeyLevel: updatedUser.journeyLevel,
            pointsGained: 50
        });

    } catch (error) {
        console.error('Complete Journey Level Error:', error);
        res.status(500).json({ message: 'Error updating journey progress' });
    }
};
