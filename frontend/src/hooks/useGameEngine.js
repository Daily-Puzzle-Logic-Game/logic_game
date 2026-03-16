import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../config/api';
import { getTodayDateString, getSecondsUntilMidnight } from '../utils/time';
import { getOrSetGuestId } from '../utils/cookie';
import SeededRandom, { encryptData } from '../utils/crypto';
import { setCurrentPuzzle, updateEngagement } from '../store/slices/gameSlice';
import { guestLogin } from '../store/slices/authSlice';

// Game Generators
import { generateNumberMatrix } from '../games/NumberMatrix/generator';
import { generatePatternMatch } from '../games/PatternMatch/generator';
import { generateSequenceSolver } from '../games/SequenceSolver/generator';
import { generateDeductionGrid } from '../games/DeductionGrid/generator';
import { generateBinaryLogic } from '../games/BinaryLogic/generator';

export const useGameEngine = () => {
    const dispatch = useDispatch();
    const { isAuthenticated, token: reduxToken } = useSelector((state) => state.auth);
    const [isInitializing, setIsInitializing] = useState(true);
    const [secondsToMidnight, setSecondsToMidnight] = useState(getSecondsUntilMidnight());
    const [userData, setUserData] = useState(null);
    const [activityHistory, setActivityHistory] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [todayCompleted, setTodayCompleted] = useState(false);

    const refetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) setIsInitializing(true);
        try {
            let currentToken = reduxToken || localStorage.getItem('token');
            const guestId = !currentToken ? getOrSetGuestId() : null;

            // 1. If no token, authenticate as guest ONLY if they were a guest previously
            const wasGuest = localStorage.getItem('isGuest') === 'true';
            if (!currentToken && guestId && wasGuest) {
                const authRes = await api.post('/api/auth/guest', { guestId });
                if (authRes.data.token) {
                    currentToken = authRes.data.token;
                    localStorage.setItem('token', currentToken);
                    
                    // Sync Redux store with silent login results
                    const { user, token } = authRes.data;
                    dispatch(guestLogin({ user, token }));
                }
            }

            if (!currentToken) {
                if (!isSilent) setIsInitializing(false);
                return;
            }

            // 2. Fetch Dashboard Data
            const res = await api.get('/api/user/dashboard');

            const cloudData = res.data;
            setUserData({
                ...cloudData.user,
                stats: cloudData.stats
            });
            setActivityHistory(cloudData.activity || []);
            setAchievements(cloudData.achievements || []);
            setTodayCompleted(cloudData.todayCompleted);

            // Sync Journey Level to Redux
            dispatch(updateEngagement({ 
                journeyLevel: cloudData.user.journeyLevel || 1,
                xp: cloudData.user.totalPoints || 0,
                streak: cloudData.user.streakCount || 0
            }));

            // 3. Generate Today's Puzzle if not completed (Only if not silent)
            if (!isSilent) {
                const todayStr = getTodayDateString();
                const rnd = new SeededRandom(todayStr);

                const dayOfWeek = new Date().getDay();
                const gameTypes = [
                    'PATTERN_MATCH', 'NUMBER_MATRIX', 'PATTERN_MATCH', 'SEQUENCE_SOLVER',
                    'DEDUCTION_GRID', 'BINARY_LOGIC', 'NUMBER_MATRIX'
                ];
                const puzzleType = gameTypes[dayOfWeek];
                const difficultyLevel = 2; // Default Medium

                let puzzleData;
                const options = { difficulty: difficultyLevel };
                switch (puzzleType) {
                    case 'NUMBER_MATRIX': puzzleData = generateNumberMatrix(rnd, options); break;
                    case 'PATTERN_MATCH': puzzleData = generatePatternMatch(rnd, options); break;
                    case 'SEQUENCE_SOLVER': puzzleData = generateSequenceSolver(rnd, options); break;
                    case 'DEDUCTION_GRID': puzzleData = generateDeductionGrid(rnd, options); break;
                    case 'BINARY_LOGIC': puzzleData = generateBinaryLogic(rnd, options); break;
                    default: puzzleData = generateNumberMatrix(rnd, options);
                }

                if (puzzleData && puzzleData.solution) {
                    puzzleData.solution = encryptData(puzzleData.solution);
                }

                dispatch(setCurrentPuzzle({
                    date: todayStr,
                    puzzleType,
                    state: puzzleData,
                    puzzleSeed: todayStr,
                    completed: cloudData.todayCompleted,
                    score: cloudData.todayScore || 0,
                    timeTaken: 0,
                    difficultyLevel,
                    startedAt: null
                }));
            }

        } catch (err) {
            console.error("GameEngine Dashboard Fetch Error", err);
        } finally {
            if (!isSilent) setIsInitializing(false);
        }
    }, [isAuthenticated, reduxToken, dispatch]);

    useEffect(() => {
        refetchData();
    }, [refetchData]);

    // Timer Loop
    useEffect(() => {
        let interval;
        if (!isInitializing) {
            interval = setInterval(() => {
                const remaining = getSecondsUntilMidnight();
                setSecondsToMidnight(remaining);

                if (remaining <= 0) {
                    window.location.reload();
                }
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isInitializing]);

    return {
        isInitializing,
        user: userData,
        activity: activityHistory,
        achievements,
        todayCompleted,
        secondsToMidnight,
        refetchData
    };
};
