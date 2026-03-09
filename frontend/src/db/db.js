import Dexie from 'dexie';

// Define the local database schema
export const db = new Dexie('LogicLooperDB');

db.version(1).stores({
    // 'user' table stores settings and overall streak progress
    // We use a predefined ID 'local_user' to always fetch the guest record
    user: 'id, streakCount, lastPlayed, totalPoints, hintsRemaining',

    // 'dailyProgress' stores the current puzzle state for the day
    // 'date' is the primary key (format: YYYY-MM-DD)
    // 'puzzleType' is the type of puzzle active today
    // 'state' is a JSON object of the grid/inputs
    // 'completed' is boolean
    dailyProgress: 'date, puzzleType, state, completed, timeTaken'
});

db.version(2).stores({
    user: 'id, streakCount, lastPlayed, totalPoints, hintsRemaining, averageSolveTime, successRate, averageHintsUsed, difficultyLevel',
    dailyProgress: 'date, puzzleType, state, completed, timeTaken, difficultyLevel, score, startedAt',
    // date is unique daily key. synced is indexed for cheap background sync lookups.
    dailyActivity: 'date, solved, score, timeTaken, difficulty, synced'
});

// Helper to initialize the default guest user if doesn't exist
export const initializeGuestUser = async () => {
    const existingUser = await db.user.get('local_user');

    if (!existingUser) {
        await db.user.add({
            id: 'local_user',
            streakCount: 0,
            lastPlayed: null, // Tracked using 'YYYY-MM-DD' strings
            totalPoints: 0,
            hintsRemaining: 3, // Resets daily
            averageSolveTime: 0,
            successRate: 0,
            averageHintsUsed: 0,
            difficultyLevel: 2
        });
        return;
    }

    // Backfill older guest records created before engagement fields existed.
    const patch = {};
    if (typeof existingUser.averageSolveTime !== 'number') patch.averageSolveTime = 0;
    if (typeof existingUser.successRate !== 'number') patch.successRate = 0;
    if (typeof existingUser.averageHintsUsed !== 'number') patch.averageHintsUsed = 0;
    if (typeof existingUser.difficultyLevel !== 'number') patch.difficultyLevel = 2;
    if (Object.keys(patch).length > 0) {
        await db.user.update('local_user', patch);
    }
};
