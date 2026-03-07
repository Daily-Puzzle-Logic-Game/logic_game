import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { useDispatch } from 'react-redux';
import { db, initializeGuestUser } from '../db/db';
import { getTodayDateString, getSecondsUntilMidnight, isStreakBroken } from '../utils/time';
import SeededRandom from '../utils/crypto';
import { setCurrentPuzzle } from '../store/slices/gameSlice';

// Game Generators
import { generateNumberMatrix } from '../games/NumberMatrix/generator';
import { generatePatternMatch } from '../games/PatternMatch/generator';
import { generateSequenceSolver } from '../games/SequenceSolver/generator';
import { generateDeductionGrid } from '../games/DeductionGrid/generator';
import { generateBinaryLogic } from '../games/BinaryLogic/generator';

/**
 * Core engine hook that syncs Local Storage, Redux, and Time loops.
 */
export const useGameEngine = () => {
    const dispatch = useDispatch();
    const [isInitializing, setIsInitializing] = useState(true);
    const [secondsToMidnight, setSecondsToMidnight] = useState(getSecondsUntilMidnight());

    // Subscribe to local IndexedDB user data reactive updates
    const user = useLiveQuery(() => db.user.get('local_user'));
    // Subscribe to today's puzzle state
    const todayProgress = useLiveQuery(() => db.dailyProgress.get(getTodayDateString()));

    useEffect(() => {
        const init = async () => {
            try {
                await initializeGuestUser();

                const todayStr = getTodayDateString();
                const existingData = await db.user.get('local_user');

                // 1. Manage Streak Logic
                if (existingData && existingData.lastPlayed) {
                    if (isStreakBroken(existingData.lastPlayed)) {
                        // Streak broke, reset it locally
                        await db.user.update('local_user', { streakCount: 0 });
                    }
                }

                // 2. Generate/Load Today's Puzzle if it doesn't exist
                const todayPuzzle = await db.dailyProgress.get(todayStr);
                if (!todayPuzzle) {
                    // New day, initialize puzzle state in DB
                    const rnd = new SeededRandom(todayStr);

                    // Rotate games based on day of week (0-6)
                    const dayOfWeek = new Date().getDay();
                    const gameTypes = [
                        'PATTERN_MATCH',   // Sun
                        'NUMBER_MATRIX',   // Mon
                        'PATTERN_MATCH',   // Tue
                        'SEQUENCE_SOLVER', // Wed
                        'DEDUCTION_GRID',  // Thu
                        'BINARY_LOGIC',    // Fri
                        'NUMBER_MATRIX'    // Sat
                    ];
                    const puzzleType = gameTypes[dayOfWeek];

                    let puzzleData;
                    switch (puzzleType) {
                        case 'NUMBER_MATRIX':
                            puzzleData = generateNumberMatrix(rnd);
                            break;
                        case 'PATTERN_MATCH':
                            puzzleData = generatePatternMatch(rnd);
                            break;
                        case 'SEQUENCE_SOLVER':
                            puzzleData = generateSequenceSolver(rnd);
                            break;
                        case 'DEDUCTION_GRID':
                            puzzleData = generateDeductionGrid(rnd);
                            break;
                        case 'BINARY_LOGIC':
                            puzzleData = generateBinaryLogic(rnd);
                            break;
                    }

                    await db.dailyProgress.add({
                        date: todayStr,
                        puzzleType,
                        state: puzzleData,
                        completed: false,
                        timeTaken: 0
                    });

                    // Reset hints on a new day
                    await db.user.update('local_user', { hintsRemaining: 3 });
                }

            } catch (err) {
                console.error("GameEngine Initialization Error", err);
            } finally {
                setIsInitializing(false);
            }
        };

        init();
    }, []);

    // 3. Time Loop: Sync the React state with the clock to force refreshes at midnight 
    useEffect(() => {
        let interval;
        if (!isInitializing) {
            interval = setInterval(() => {
                const remaining = getSecondsUntilMidnight();
                setSecondsToMidnight(remaining);

                // If Midnight hit while the app was open, force a hard reload 
                // to re-trigger the init hooks and fetch the new puzzle seed.
                if (remaining <= 0) {
                    window.location.reload();
                }
            }, 1000); // Check every second
        }

        return () => clearInterval(interval);
    }, [isInitializing]);

    // 4. Push local IndexedDB state into Redux for React components to consume easily
    useEffect(() => {
        if (todayProgress) {
            dispatch(setCurrentPuzzle(todayProgress));
        }
    }, [todayProgress, dispatch]);

    return {
        isInitializing,
        user,
        todayProgress,
        secondsToMidnight
    };
};
