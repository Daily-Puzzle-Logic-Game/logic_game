import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle, Sparkles, Timer as TimerIcon, Trophy, Lightbulb, RotateCcw, Power, Zap, Activity, Flame, ShieldCheck, Star, Target } from 'lucide-react';
import CelebrationBurst from '../ui/CelebrationBurst';
import ParticleField from '../ui/ParticleField';
import api, { getApiUrl } from '../../config/api';
import { getTodayDateString } from '../../utils/time';
import { PUZZLE_TYPES, PUZZLE_COMPONENTS } from '../../config/puzzleTypes';
import SeededRandom, { generateScoreHash, encryptData, decryptData } from '../../utils/crypto';
import { calculateProgress } from '../../utils/progress';
import { useEngagement } from '../../hooks/useEngagement';
import { useGameEngine } from '../../hooks/useGameEngine';
import { triggerRewardConfetti } from '../effects/ConfettiManager';
import ProgressBar from '../ui/ProgressBar';
import AnimatedScore from '../effects/AnimatedScore';
import SessionExtender from '../ui/SessionExtender';
import LogicMascot from '../ui/LogicMascot';
import { playSound } from '../../utils/SoundManager';
import { checkAchievements } from '../../utils/achievementDetection';
import { unlockAchievement } from '../../store/slices/achievementSlice';
import { useDispatch, useSelector } from 'react-redux';
import { addXP, updateEngagement, useHint, buyHintSuccess } from '../../store/slices/gameSlice';

// Engagement Engines
import ProgressEngine from '../../engines/ProgressEngine';
import StreakEngine from '../../engines/StreakEngine';
import AchievementEngine from '../../engines/AchievementEngine';
import DifficultyEngine from '../../engines/DifficultyEngine';
import GameHUD from './GameHUD';
import StorageManager from '../../utils/StorageManager';
import SyncManager from '../../utils/SyncManager';

// Utilities
import { THEMES, getCurrentTheme, setTheme as setPuzzleTheme } from '../../utils/ThemeManager';

// Components
import NeuralBackground from '../effects/NeuralBackground';
import RewardChain from '../rewards/RewardChain';

// Generators
import { generateNumberMatrix } from '../../games/NumberMatrix/generator';
import { generatePatternMatch } from '../../games/PatternMatch/generator';
import { generateSequenceSolver } from '../../games/SequenceSolver/generator';
import { generateDeductionGrid } from '../../games/DeductionGrid/generator';
import { generateBinaryLogic } from '../../games/BinaryLogic/generator';

// Validators
import { validateNumberMatrix } from '../../games/NumberMatrix/validator';
import { validatePatternMatch } from '../../games/PatternMatch/validator';
import { validateSequenceSolver } from '../../games/SequenceSolver/validator';
import { validateDeductionGrid } from '../../games/DeductionGrid/validator';
import { validateBinaryLogic } from '../../games/BinaryLogic/validator';

/**
 * The Master Engine Wrapper
 * Handles loading, saving, and validating any puzzle type.
 */
const PuzzleContainer = ({ user: propUser, todayProgress, practiceMode = false, practiceType = null, triggerSync = null, isJourney = false }) => {
    const dispatch = useDispatch();
    const { user: hookUser } = useGameEngine();
    const unlockedIds = useSelector((state) => state.achievements.unlockedIds);
    const user = propUser || hookUser;

    // Helper: Format time
    const formatGameTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const [activeState, setActiveState] = useState(null);
    const [statusMsg, setStatusMsg] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [shake, setShake] = useState(false);
    const [showCelebration, setShowCelebration] = useState(false);
    const [earnedScore, setEarnedScore] = useState(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [isNearMiss, setIsNearMiss] = useState(false);
    const [showSessionExtender, setShowSessionExtender] = useState(false);
    const [showRetryOverlay, setShowRetryOverlay] = useState(false);
    
    // UI States
    const [currentTheme, setCurrentTheme] = useState(getCurrentTheme());
    const [mascotState, setMascotState] = useState('idle');
    const [mascotMsg, setMascotMsg] = useState('');
    const [isTimerStarted, setIsTimerStarted] = useState(false);
    const [hintsUsedCount, setHintsUsedCount] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [bonusObjectives, setBonusObjectives] = useState({ speed: false, hintless: false, perfect: false });
    const [lastActionTime, setLastActionTime] = useState(Date.now());

    const [gameTime, setGameTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showSolvedSplash, setShowSolvedSplash] = useState(false);
    const [newAchievements, setNewAchievements] = useState([]);

    useEffect(() => {
        setPuzzleTheme(currentTheme);
    }, [currentTheme]);

    const { getNearMissStatus } = useEngagement(user);
    const timerRef = useRef(null);

    // Initial Mascot Intro
    useEffect(() => {
        if (!isLoading) {
            setMascotState('wave');
            setMascotMsg(practiceMode ? "Practice makes perfect!" : "Let's crack today's code!");
            setTimeout(() => setMascotMsg(''), 3000);
            playSound('click');
        }
    }, [isLoading]);

    // Timer Logic
    useEffect(() => {
        if (!isLoading && !hasSubmitted && !isPaused && isTimerStarted) {
            timerRef.current = setInterval(() => {
                setGameTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isLoading, hasSubmitted, isPaused, isTimerStarted]);

    // LocalStorage Persistence - Save
    useEffect(() => {
        if (!practiceMode && activeState && !hasSubmitted && isTimerStarted) {
            const dateStr = getTodayDateString();
            const stateToSave = {
                state: activeState,
                gameTime,
                isTimerStarted,
                hintsUsedCount,
                mistakes
            };
            StorageManager.setItem(`dailyPuzzleState_${dateStr}`, stateToSave);
        }
    }, [activeState, gameTime, isTimerStarted, hintsUsedCount, mistakes, practiceMode, hasSubmitted]);

    // Hydrate state
    useEffect(() => {
        const initPractice = async () => {
            setIsLoading(true);
            const rnd = new SeededRandom(Date.now().toString());
            const type = practiceType || PUZZLE_TYPES.NUMBER_MATRIX;

            let puzzleData;
            switch (type) {
                case PUZZLE_TYPES.NUMBER_MATRIX: puzzleData = generateNumberMatrix(rnd); break;
                case PUZZLE_TYPES.PATTERN_MATCH: puzzleData = generatePatternMatch(rnd); break;
                case PUZZLE_TYPES.SEQUENCE_SOLVER: puzzleData = generateSequenceSolver(rnd); break;
                case PUZZLE_TYPES.DEDUCTION_GRID: puzzleData = generateDeductionGrid(rnd); break;
                case PUZZLE_TYPES.BINARY_LOGIC: puzzleData = generateBinaryLogic(rnd); break;
                default: puzzleData = generateNumberMatrix(rnd);
            }

            setActiveState(puzzleData);
            setIsLoading(false);
        };

        if (practiceMode) {
            initPractice();
        } else if (todayProgress) {
            const dateStr = getTodayDateString();
            const saved = StorageManager.getItem(`dailyPuzzleState_${dateStr}`);
            
            if (saved && !todayProgress.completed) {
                try {
                    setActiveState(saved.state);
                    setGameTime(saved.gameTime || 0);
                    setIsTimerStarted(saved.isTimerStarted || false);
                    setHintsUsedCount(saved.hintsUsedCount || 0);
                    setMistakes(saved.mistakes || 0);
                    setProgress(calculateProgress(todayProgress.puzzleType, saved.state));
                } catch (e) {
                    console.error("Failed to restore saved puzzle state", e);
                    setActiveState(todayProgress.state);
                }
            } else {
                setActiveState(todayProgress.state);
                if (todayProgress.completed) {
                    setHasSubmitted(true);
                    setProgress(100);
                }
            }
            setIsLoading(false);
        }
    }, [todayProgress, practiceMode, practiceType]);

    const handleValueUpdate = (newState) => {
        if (!practiceMode && todayProgress?.completed) return;
        if (hasSubmitted) return;

        setActiveState(newState);
        if (!isTimerStarted) setIsTimerStarted(true);
        playSound('click');

        const type = practiceMode ? practiceType : todayProgress.puzzleType;
        const newProgress = calculateProgress(type, newState);
        setProgress(newProgress);
        
        const nearMiss = getNearMissStatus(newProgress);
        setIsNearMiss(nearMiss);
        if (nearMiss) {
            setMascotState('thinking');
            setMascotMsg("So close! I can almost see the answer...");
            setTimeout(() => setMascotMsg(''), 2000);
        }

        setStatusMsg(null);
    };


    // Inactivity Check for Mascot
    useEffect(() => {
        const interval = setInterval(() => {
            if (Date.now() - lastActionTime > 30000 && !showSolvedSplash && !isPaused) {
                setMascotState('thinking');
                setMascotMsg("Need a neural jumpstart? I've got hints!");
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [lastActionTime, showSolvedSplash, isPaused]);

    const handleReset = () => {
        if (hasSubmitted) return;
        playSound('click');
        
        let initialState;
        if (practiceMode) {
            // For practice mode, we create a fresh copy of the initial state from when it was generated
            initialState = JSON.parse(JSON.stringify(activeState.initial));
        } else {
            initialState = JSON.parse(JSON.stringify(todayProgress.state.initial));
        }

        const type = practiceMode ? practiceType : todayProgress.puzzleType;
        
        // Construct the new state based on type
        let newState = { ...activeState };
        if (type === PUZZLE_TYPES.NUMBER_MATRIX || type === PUZZLE_TYPES.PATTERN_MATCH) {
            newState.grid = initialState;
        } else if (type === PUZZLE_TYPES.DEDUCTION_GRID) {
            newState.gridState = initialState;
        } else if (type === PUZZLE_TYPES.BINARY_LOGIC) {
            newState.inputs = JSON.parse(JSON.stringify(initialState));
        } else if (type === PUZZLE_TYPES.SEQUENCE_SOLVER) {
            // Sequence solver doesn't really have a "grid" to clear, but we can reset any local input if we had one
        }

        setActiveState(newState);
        setGameTime(0);
        setMistakes(0);
        setProgress(0);
        setStatusMsg(null);
        setMascotMsg("Fresh start! You've got this.");
        setTimeout(() => setMascotMsg(''), 2000);
    };

    const handleHint = async () => {
        if (hasSubmitted) return;

        if ((user?.hintsRemaining ?? 0) <= 0) {
            const HINT_COST = 500;
            const currentPoints = user?.totalPoints || 0;

            if (currentPoints >= HINT_COST) {
                setMascotMsg(`Spend ${HINT_COST} points for a logic boost?`);
                setMascotState('thinking');
                
                const confirmPurchase = window.confirm(`Out of hints! Spend ${HINT_COST} points to buy 1 extra hint?`);
                if (confirmPurchase) {
                    try {
                        const response = await api.post('/api/user/buy-hint', {});
                        
                        if (response.status === 200) {
                            dispatch(buyHintSuccess({ totalPoints: response.data.totalPoints }));
                            setMascotMsg("Logic boost acquired! Analyzing neural paths...");
                            setMascotState('celebrate');
                            
                            // Proceed to reveal hint (using the new hint just bought)
                             setTimeout(() => executeHintReveal(), 500);
                        }
                    } catch (err) {
                        console.error('Purchase failed:', err);
                        setMascotMsg("Neural link failed! Check your connection.");
                    }
                }
            } else {
                setMascotMsg("Out of hints! Solve more puzzles to earn points.");
                setTimeout(() => setMascotMsg(''), 3000);
            }
            return;
        }

        executeHintReveal();
    };

    const executeHintReveal = () => {
        playSound('unlock');
        dispatch(useHint());
        setHintsUsedCount(prev => prev + 1);
        
        const type = practiceMode ? practiceType : todayProgress.puzzleType;
        const newState = { ...activeState };
        const solution = activeState.solution && typeof activeState.solution === 'string' 
            ? decryptData(activeState.solution) 
            : activeState.solution;
            
        let hintApplied = false;

        if (type === PUZZLE_TYPES.NUMBER_MATRIX || type === PUZZLE_TYPES.PATTERN_MATCH) {
            const { grid } = activeState;
            for (let r = 0; r < grid.length; r++) {
                for (let c = 0; c < grid[r].length; c++) {
                    if (grid[r][c] === null || grid[r][c] !== solution[r][c]) {
                        newState.grid = grid.map(row => [...row]);
                        newState.grid[r][c] = solution[r][c];
                        hintApplied = true;
                        break;
                    }
                }
                if (hintApplied) break;
            }
        } else if (type === PUZZLE_TYPES.BINARY_LOGIC) {
            const { inputs } = activeState;
            const keys = ['a', 'b', 'c'];
            for (const key of keys) {
                if (inputs[key] === null) {
                    newState.inputs = { ...inputs, [key]: solution[key] };
                    hintApplied = true;
                    break;
                }
            }
        } else if (type === PUZZLE_TYPES.SEQUENCE_SOLVER) {
            setMascotMsg("The hidden pattern is awaiting your discovery...");
            setTimeout(() => setMascotMsg(''), 3000);
            return;
        }

        if (hintApplied) {
            setActiveState(newState);
            setMascotMsg("Here's a little nudge in the right direction!");
            setTimeout(() => setMascotMsg(''), 3000);
            
            const newProgress = calculateProgress(type, newState);
            setProgress(newProgress);
        }
    };

    const handleValidation = async () => {
        if (!activeState || hasSubmitted) return;

        let result;
        const type = practiceMode ? practiceType : todayProgress.puzzleType;
        const solution = activeState.solution && typeof activeState.solution === 'string' 
            ? decryptData(activeState.solution) 
            : activeState.solution;

        switch (type) {
            case PUZZLE_TYPES.NUMBER_MATRIX: result = validateNumberMatrix(activeState.grid, solution); break;
            case PUZZLE_TYPES.PATTERN_MATCH: result = validatePatternMatch(activeState.grid, solution); break;
            case PUZZLE_TYPES.SEQUENCE_SOLVER: result = validateSequenceSolver(activeState.sequence[activeState.index], solution); break;
            case PUZZLE_TYPES.DEDUCTION_GRID: result = validateDeductionGrid(activeState.gridState, solution); break;
            case PUZZLE_TYPES.BINARY_LOGIC: result = validateBinaryLogic(activeState.inputs, activeState.target, activeState.gates); break;
            default: result = { valid: false, message: "Unknown puzzle type." };
        }

        if (result.valid) {
            playSound('sparkle_shine');
            setHasSubmitted(true);
            setProgress(100);
            setIsNearMiss(false);
            setStatusMsg({ type: 'success', text: "LOGIC CONFIRMED!" });
            
            setMascotState('celebrate');
            setMascotMsg("INcredible! You solved it!");
            
            triggerRewardConfetti('mid');
            setShowCelebration(true);
            setTimeout(() => {
                setShowCelebration(false);
                setMascotMsg('');
            }, 3000);

            const timeTaken = gameTime;
            const difficulty = practiceMode ? 2 : (todayProgress?.difficultyLevel || 2);
            
            // New Score Formula: score = baseScore * diffMult * timeMult - hintPenalty
            const baseScore = 500;
            const diffMultipliers = { 1: 1.0, 2: 1.5, 3: 2.0, 4: 2.5 };
            const diffMult = diffMultipliers[difficulty] || 1.5;
            const timeMult = Math.max(0.5, 1 - (timeTaken / 600)); // Capped at 10 mins
            const hintPenalty = hintsUsedCount * 100;
            
            let totalXP = Math.round(baseScore * diffMult * timeMult - hintPenalty);
            if (practiceMode) totalXP = Math.round(totalXP / 2); // Half XP for practice
            
            const speedBonus = timeTaken < 120;
            const hintlessBonus = hintsUsedCount === 0;
            const perfectBonus = mistakes === 0;

            if (speedBonus) totalXP += 200;
            if (hintlessBonus) totalXP += 150;
            if (perfectBonus) totalXP += 100;

            setBonusObjectives({ speed: speedBonus, hintless: hintlessBonus, perfect: perfectBonus });
            setEarnedScore(totalXP);
            setShowSolvedSplash(true);
            dispatch(addXP(totalXP));
            
            // Clear local storage on solve
            if (!practiceMode) {
                const dateStr = getTodayDateString();
                localStorage.removeItem(`dailyPuzzleState_${dateStr}`);
            }
            
            // Note: showSolvedSplash dismissal is now handled by RewardChain's onClose callback
            
            // Check Achievements
            const currentStats = user?.stats || { totalSolved: 0, currentStreak: 0, bestTime: 9999, perfectSolves: 0 };
            const updatedStats = {
                ...currentStats,
                totalSolved: currentStats.totalSolved + 1,
                bestTime: currentStats.bestTime === 0 ? timeTaken : Math.min(currentStats.bestTime, timeTaken),
                perfectSolves: currentStats.perfectSolves + (perfectBonus ? 1 : 0),
            };

            const achievements = AchievementEngine.checkProgress(updatedStats);
            const newlyUnlocked = achievements.filter(a => a.unlocked && !unlockedIds.includes(a.id));
            setNewAchievements(newlyUnlocked);
            
            newlyUnlocked.forEach(ach => {
                playSound('crystal_ding');
                dispatch(unlockAchievement(ach.id));
            });

            const syncResultsBatched = async () => {
                try {
                    const seed = practiceMode ? `practice-${Date.now()}` : (todayProgress?.puzzleSeed || getTodayDateString());
                    
                    // CRITICAL: Ensure we use the exact same ID logic as backend
                    const authUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const identity = authUser?.id || user?.id || 'guest';
                    
                    const hash = generateScoreHash(identity, totalXP, timeTaken, seed);
                    
                    const scoreData = {
                        date: practiceMode ? `practice-${Date.now()}` : getTodayDateString(),
                        puzzleId: type,
                        score: totalXP,
                        timeTaken,
                        mistakes,
                        hintsUsed: hintsUsedCount,
                        seed,
                        hash,
                        bonuses: { speed: speedBonus, hintless: hintlessBonus, perfect: perfectBonus }
                    };

                    const result = await SyncManager.queueScore(scoreData);
                    
                    if (result.status === 'synced') {
                        if (triggerSync) triggerSync();
                        if (result.data?.achievements) {
                            // Backend might return achievements unlocked during batch
                        }
                    }

                    // Journey progression still syncs immediately for UI feedback
                    if (isJourney) {
                        const token = localStorage.getItem('token');
                        await axios.post(getApiUrl('/api/user/journey/complete'), {
                            levelSolved: todayProgress.level
                        }, { headers: { Authorization: `Bearer ${token}` } });
                    }

                    setTimeout(() => setShowSessionExtender(true), 1500);
                } catch (err) { console.error(err); }
            };
            syncResultsBatched();
        } else {
            playSound('wrong');
            setMistakes(prev => prev + 1);
            setMascotState('retry');
            setMascotMsg("Wait... that logic doesn't hold up.");
            setShowRetryOverlay(true);
            
            setTimeout(() => {
                setMascotMsg('');
                setMascotState('idle');
                setShowRetryOverlay(false);
            }, 3500);

            setStatusMsg({ type: 'error', text: result.message });
            setShake(true);
            setTimeout(() => setShake(false), 600);
        }
    };

    if (isLoading || !activeState) {
        return (
            <div className="flex flex-col items-center justify-center p-24 text-cyan">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Loader2 className="w-12 h-12 mb-4 opacity-50" />
                </motion.div>
                <p className="font-mono text-xs tracking-widest uppercase opacity-40">Initializing Neural Link...</p>
            </div>
        );
    }

    // Final Polish HUD Data
    const levelInfo = ProgressEngine.getCurrentLevelInfo(user);
    const streakVisual = StreakEngine.getVisualTier(user?.streakCount || 0);
    const globalSolvers = 4281 + (Math.floor(Math.random() * 10)); // Simulated live data
    const globalRank = user?.stats?.totalSolved > 0 ? `#${Math.max(1, 100 - user.stats.totalSolved)}` : '#---';

    const type = practiceMode ? practiceType : todayProgress?.puzzleType;
    const ActiveComponent = PUZZLE_COMPONENTS[type] || PUZZLE_COMPONENTS.NUMBER_MATRIX;

    return (
        <div className="w-full min-h-screen flex flex-col items-center pt-24">
            <NeuralBackground theme={currentTheme} />

            {/* Game HUD (Top Bar) */}
            <GameHUD 
                streak={user?.streakCount || 0}
                time={formatGameTime(gameTime)}
                levelName={levelInfo.name}
                rank={globalRank}
                globalSolvers={globalSolvers}
            />

            {/* Theme Switcher Overlay (Mobile Style) */}
            <div className="fixed bottom-32 left-8 z-[100] flex flex-col gap-3">
                {Object.values(THEMES).map(theme => (
                    <motion.button
                        key={theme}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setCurrentTheme(theme)}
                        className={`w-12 h-12 rounded-2xl border backdrop-blur-xl flex items-center justify-center transition-all ${
                            currentTheme === theme 
                            ? 'bg-theme-primary border-white shadow-[0_0_15px_var(--theme-primary)] text-black' 
                            : 'bg-black/20 border-white/10 text-white/40 hover:text-white'
                        }`}
                        title={theme.replace('_', ' ')}
                    >
                        {theme === THEMES.LOGIC_LAB && <Zap size={18} />}
                        {theme === THEMES.NATURE && <Star size={18} />}
                        {theme === THEMES.SPACE && <Activity size={18} />}
                    </motion.button>
                ))}
            </div>

            {/* Main Content Area */}
            <motion.div
                animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="relative z-10 w-full max-w-2xl px-4 flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]"
            >
                {/* Mascot Units - Balanced Placement */}
                <div className="absolute -left-16 md:-left-64 top-1/2 -translate-y-1/2 z-20">
                    <LogicMascot state={mascotState} message={mascotMsg} />
                </div>


                {/* Game Board Surface */}
                <div className="w-full bg-theme-bg/40 backdrop-blur-3xl border border-white/5 p-4 md:p-10 rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                    <div className="absolute inset-x-0 h-[2px] top-0 bg-gradient-to-r from-transparent via-theme-primary to-transparent opacity-30 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Celebration Overlay */}
                    <AnimatePresence>
                        {showCelebration && (
                            <div className="absolute inset-0 z-50 pointer-events-none flex flex-col items-center justify-center bg-theme-primary/10 backdrop-blur-sm transition-colors">
                                <ParticleField />
                                <CelebrationBurst />
                                <motion.div
                                    initial={{ scale: 0, rotate: -20 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="relative"
                                >
                                    <div className="flex items-center gap-4">
                                        <img 
                                            src="/assets/stickers/assistant_cheer.png" 
                                            alt="Cheer" 
                                            className="w-48 floating-sticker" 
                                        />
                                    </div>
                                    <div className="mt-4 px-6 py-2 bg-theme-primary text-black font-black uppercase tracking-widest rounded-full shadow-2xl">
                                        Logic_Mastery_Achieved!
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Retry Overlay */}
                    <AnimatePresence>
                        {showRetryOverlay && !showCelebration && (
                            <div className="absolute inset-0 z-[45] pointer-events-none flex flex-col items-center justify-end pb-12">
                                <motion.div
                                    initial={{ opacity: 0, y: 100 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 100, transition: { duration: 0.8, ease: 'easeIn' } }}
                                    transition={{ type: 'spring', damping: 15, stiffness: 100 }}
                                    className="flex flex-col items-center"
                                >
                                    <img 
                                        src="/assets/stickers/assistant_retry.png" 
                                        alt="Retry" 
                                        className="w-40 floating-sticker drop-shadow-[0_0_30px_rgba(239,68,68,0.3)]" 
                                    />
                                    <div className="mt-2 px-6 py-2 bg-red-600/90 backdrop-blur-md text-white text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl border border-white/10">
                                        Logic Error Detected!
                                    </div>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>

                    {/* Progress Bar */}
                    <ProgressBar progress={progress} />

                    {/* Game Content Area */}
                    <div className="mt-8 mb-12 relative">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={practiceMode ? practiceType : todayProgress?.puzzleType}
                                initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="w-full"
                            >
                                <ActiveComponent
                                    puzzleState={activeState}
                                    onUpdate={handleValueUpdate}
                                    isReadOnly={hasSubmitted}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Earned Score Animation */}
                        <AnimatePresence>
                            {earnedScore && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5, y: 0 }}
                                    animate={{ opacity: 1, scale: 1.5, y: -100 }}
                                    exit={{ opacity: 0, y: -200 }}
                                    className="absolute inset-0 flex flex-col items-center justify-center z-[60] pointer-events-none"
                                >
                                    <div className="flex items-center gap-2 text-6xl font-black text-transparent bg-clip-text bg-gradient-to-t from-gold to-orange drop-shadow-[0_0_20px_rgba(250,204,21,0.6)]">
                                        <AnimatedScore value={earnedScore} />
                                    </div>
                                    <span className="text-sm tracking-[0.5em] uppercase text-gold font-black mt-2">Data_Recovered</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Bonus Results Overlay */}
                    <AnimatePresence>
                        {hasSubmitted && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute inset-x-8 bottom-32 z-50 bg-black/80 backdrop-blur-md border border-white/10 p-6 rounded-3xl shadow-2xl"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <Sparkles className="text-gold" size={20} />
                                    <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Neural Sync Bonuses</h4>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-3">
                                    <div className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${bonusObjectives.speed ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' : 'bg-white/5 border-white/10 text-white/20'}`}>
                                        <Zap size={18} className={bonusObjectives.speed ? 'animate-pulse' : ''} />
                                        <span className="text-[8px] font-bold uppercase mt-2 tracking-widest text-center">Speed Demon</span>
                                        {bonusObjectives.speed && <span className="text-[10px] font-black mt-1">+{ProgressEngine.XP_MAP.BONUS_SPEED} XP</span>}
                                    </div>
                                    <div className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${bonusObjectives.hintless ? 'bg-purple-500/20 border-purple-500/50 text-purple-400' : 'bg-white/5 border-white/10 text-white/20'}`}>
                                        <Lightbulb size={18} />
                                        <span className="text-[8px] font-bold uppercase mt-2 tracking-widest text-center">No Hints</span>
                                        {bonusObjectives.hintless && <span className="text-[10px] font-black mt-1">+{ProgressEngine.XP_MAP.BONUS_HINTLESS} XP</span>}
                                    </div>
                                    <div className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${bonusObjectives.perfect ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-white/5 border-white/10 text-white/20'}`}>
                                        <ShieldCheck size={18} />
                                        <span className="text-[8px] font-bold uppercase mt-2 tracking-widest text-center">Perfect</span>
                                        {bonusObjectives.perfect && <span className="text-[10px] font-black mt-1">+{ProgressEngine.XP_MAP.BONUS_PERFECT} XP</span>}
                                    </div>
                                </div>

                                <button
                                    onClick={() => navigate('/games')}
                                    className="w-full mt-6 py-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all"
                                >
                                    Establish Next Link
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Action Footer */}
                    <div className="w-full border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex gap-4 relative">

                            <button 
                                onMouseEnter={() => playSound('hover')}
                                onClick={handleReset}
                                disabled={hasSubmitted}
                                className={`p-3 rounded-2xl transition-all transform hover:rotate-12 active:rotate-45 ${hasSubmitted ? 'bg-white/5 text-white/5 opacity-50' : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white'}`} 
                                title="Reset Simulation"
                            >
                                <RotateCcw size={20} />
                            </button>
                            <button 
                                onMouseEnter={() => playSound('hover')}
                                onClick={handleHint}
                                disabled={hasSubmitted || (user?.hintsRemaining <= 0)}
                                className={`p-3 rounded-2xl transition-all transform hover:-translate-y-1 ${hasSubmitted || (user?.hintsRemaining <= 0) ? 'bg-white/5 text-white/5 opacity-50' : 'bg-white/5 hover:bg-white/10 text-white/40 hover:text-white'}`} 
                                title="Get Hint"
                            >
                                <Lightbulb size={20} />
                            </button>
                        </div>

                        <AnimatePresence>
                            {statusMsg && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className={`px-6 py-2 rounded-2xl font-black text-[10px] tracking-widest uppercase shadow-lg
                                        ${statusMsg.type === 'error' ? 'bg-error/20 text-error border border-error/50' : 'bg-gold/20 text-gold border border-gold/50'}
                                    `}
                                >
                                    {statusMsg.text}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={() => {
                                handleValidation();
                                playSound('tap');
                            }}
                            disabled={hasSubmitted}
                            className={`px-10 py-4 rounded-[1.5rem] font-black text-sm tracking-[0.2em] uppercase transition-all flex items-center gap-3
                                ${hasSubmitted ? 'bg-white/5 text-white/20' : 'btn-game-primary text-white hover:scale-[1.05] active:scale-95'}
                            `}
                        >
                            {hasSubmitted ? <Power size={18} /> : <Zap size={18} className="text-gold animate-pulse" />}
                            {hasSubmitted ? 'SIM_COMPLETE' : 'EXECUTE_LOGIC'}
                        </button>
                    </div>
                </div>

                {/* Bottom Stats Details */}
                <div className="w-full mt-6 grid grid-cols-3 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                        <span className="text-[10px] font-black text-white/20 uppercase mb-1">Hints_Left</span>
                        <p className="text-xl font-black text-cyan">{user?.hintsRemaining || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                        <span className="text-[10px] font-black text-white/20 uppercase mb-1">Active_Streak</span>
                        <p className="text-xl font-black text-gold">{user?.streakCount || 0}</p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                        <span className="text-[10px] font-black text-white/20 uppercase mb-1">Difficulty</span>
                        <p className="text-xl font-black text-orange">{practiceMode ? '2' : (todayProgress?.difficultyLevel || 1)}</p>
                    </div>
                </div>
            </motion.div>

            <SessionExtender isOpen={showSessionExtender} onClose={() => setShowSessionExtender(false)} />

            {/* JOURNEY REWARD CHAIN */}
            <RewardChain 
                isOpen={showSolvedSplash} 
                onClose={() => {
                    setShowSolvedSplash(false);
                    setShowSessionExtender(true);
                }}
                xpGained={earnedScore}
                streakCount={user?.streakCount || 0}
                achievements={newAchievements}
            />
        </div>
    );
};

export default PuzzleContainer;
