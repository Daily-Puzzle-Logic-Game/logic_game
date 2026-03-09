import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LightbulbOff, Trophy, CheckCircle, XCircle, Clock, Award, Lock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { db } from '../db/db';
import BinaryLogicComponent from '../games/BinaryLogic/Component';
import DeductionGridComponent from '../games/DeductionGrid/Component';
import NumberMatrixComponent from '../games/NumberMatrix/Component';
import PatternMatchComponent from '../games/PatternMatch/Component';
import SequenceSolverComponent from '../games/SequenceSolver/Component';
import { generateBinaryLogic } from '../games/BinaryLogic/generator';
import { generateDeductionGrid } from '../games/DeductionGrid/generator';
import { generateNumberMatrix } from '../games/NumberMatrix/generator';
import { generatePatternMatch } from '../games/PatternMatch/generator';
import { generateSequenceSolver } from '../games/SequenceSolver/generator';
import { validateBinaryLogic } from '../games/BinaryLogic/validator';
import { validateDeductionGrid } from '../games/DeductionGrid/validator';
import { validateNumberMatrix } from '../games/NumberMatrix/validator';
import { validatePatternMatch } from '../games/PatternMatch/validator';
import { validateSequenceSolver } from '../games/SequenceSolver/validator';

// Seeded random generator
class SeededRandom {
    constructor(seed) {
        this.seed = seed;
    }

    next() {
        this.seed = (this.seed * 9301 + 49297) % 233280;
        return this.seed / 233280;
    }

    range(min, max) {
        return Math.floor(this.next() * (max - min)) + min;
    }

    shuffle(array) {
        const arr = [...array];
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(this.next() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
}

const PUZZLE_TYPES = ['BINARY_LOGIC', 'DEDUCTION_GRID', 'NUMBER_MATRIX', 'PATTERN_MATCH', 'SEQUENCE_SOLVER'];

const PUZZLE_COMPONENTS = {
    BINARY_LOGIC: BinaryLogicComponent,
    DEDUCTION_GRID: DeductionGridComponent,
    NUMBER_MATRIX: NumberMatrixComponent,
    PATTERN_MATCH: PatternMatchComponent,
    SEQUENCE_SOLVER: SequenceSolverComponent
};

const PUZZLE_GENERATORS = {
    BINARY_LOGIC: generateBinaryLogic,
    DEDUCTION_GRID: generateDeductionGrid,
    NUMBER_MATRIX: generateNumberMatrix,
    PATTERN_MATCH: generatePatternMatch,
    SEQUENCE_SOLVER: generateSequenceSolver
};

const PUZZLE_VALIDATORS = {
    BINARY_LOGIC: validateBinaryLogic,
    DEDUCTION_GRID: validateDeductionGrid,
    NUMBER_MATRIX: validateNumberMatrix,
    PATTERN_MATCH: validatePatternMatch,
    SEQUENCE_SOLVER: validateSequenceSolver
};

const PUZZLE_NAMES = {
    BINARY_LOGIC: 'Binary Logic',
    DEDUCTION_GRID: 'Deduction Grid',
    NUMBER_MATRIX: 'Number Matrix',
    PATTERN_MATCH: 'Pattern Match',
    SEQUENCE_SOLVER: 'Sequence Solver'
};

// Generate 10 hintless puzzles (medium difficulty)
const generateHintlessPuzzles = () => {
    const puzzles = [];
    
    for (let i = 0; i < 10; i++) {
        const seededRandom = new SeededRandom(5000 + i);
        const typeIndex = i % 5;
        const type = PUZZLE_TYPES[typeIndex];
        const generator = PUZZLE_GENERATORS[type];
        
        const puzzleData = generator(seededRandom);
        
        puzzles.push({
            id: i + 1,
            type,
            difficulty: 'Medium',
            data: puzzleData,
            timeLimit: 180 // 3 minutes per puzzle
        });
    }
    
    return puzzles;
};

const CHALLENGE_PUZZLES = generateHintlessPuzzles();

const HintlessHeroChallenge = () => {
    const navigate = useNavigate();
    const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
    const [completedPuzzles, setCompletedPuzzles] = useState(new Set());
    const [timeRemaining, setTimeRemaining] = useState(180);
    const [isActive, setIsActive] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);
    const [badgeEarned, setBadgeEarned] = useState(false);
    const [currentPuzzleState, setCurrentPuzzleState] = useState(null);
    const [statusMsg, setStatusMsg] = useState(null);

    // Load progress
    useEffect(() => {
        const loadProgress = async () => {
            const progress = await db.dailyProgress.get('hintless_hero_challenge');
            const badge = await db.achievements.get('hintless_hero');
            
            if (progress) {
                setCompletedPuzzles(new Set(progress.completedPuzzles || []));
                setCurrentPuzzleIndex(progress.currentPuzzleIndex || 0);
            }
            
            if (badge) {
                setBadgeEarned(true);
            }
        };
        loadProgress();
    }, []);

    // Save progress
    const saveProgress = useCallback(async () => {
        await db.dailyProgress.put({
            date: 'hintless_hero_challenge',
            puzzleType: 'HINTLESS_HERO',
            state: 'in_progress',
            completed: completedPuzzles.size === 10,
            completedPuzzles: Array.from(completedPuzzles),
            currentPuzzleIndex,
            synced: false
        });
    }, [completedPuzzles, currentPuzzleIndex]);

    // Timer
    useEffect(() => {
        let interval;
        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        setIsActive(false);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, timeRemaining]);

    // Initialize puzzle
    useEffect(() => {
        const puzzle = CHALLENGE_PUZZLES[currentPuzzleIndex];
        setTimeRemaining(puzzle.timeLimit);
        setIsActive(true);
        setCurrentPuzzleState(puzzle.data);
        setStatusMsg(null);
    }, [currentPuzzleIndex]);

    const handleValueUpdate = (newState) => {
        setCurrentPuzzleState(newState);
        setStatusMsg(null);
    };

    const handleValidation = async () => {
        if (!currentPuzzleState) return;

        const currentPuzzle = CHALLENGE_PUZZLES[currentPuzzleIndex];
        const validator = PUZZLE_VALIDATORS[currentPuzzle.type];
        
        let result;
        switch (currentPuzzle.type) {
            case 'NUMBER_MATRIX':
                result = validator(currentPuzzleState.grid, currentPuzzle.data.solution);
                break;
            case 'PATTERN_MATCH':
                result = validator(currentPuzzleState.grid, currentPuzzle.data.solution);
                break;
            case 'SEQUENCE_SOLVER':
                result = validator(currentPuzzleState.sequence[currentPuzzleState.index], currentPuzzle.data.solution);
                break;
            case 'DEDUCTION_GRID':
                result = validator(currentPuzzleState.gridState, currentPuzzle.data.solution);
                break;
            case 'BINARY_LOGIC':
                result = validator(currentPuzzleState.inputs, currentPuzzle.data.target, currentPuzzle.data.gates);
                break;
            default:
                result = { valid: false, message: "Unknown puzzle type." };
        }

        if (result.valid) {
            setStatusMsg({ type: 'success', text: result.message });
            setIsActive(false);
            const newCompleted = new Set(completedPuzzles);
            newCompleted.add(currentPuzzleIndex);
            setCompletedPuzzles(newCompleted);
            
            await saveProgress();

            if (newCompleted.size === 10) {
                await awardBadge();
                setTimeout(() => setShowCompletion(true), 1500);
            } else {
                setTimeout(() => {
                    setCurrentPuzzleIndex(prev => prev + 1);
                    setStatusMsg(null);
                }, 1500);
            }
        } else {
            setStatusMsg({ type: 'error', text: result.message });
        }
    };

    const awardBadge = async () => {
        const existingBadge = await db.achievements.get('hintless_hero');
        if (!existingBadge) {
            await db.achievements.add({
                id: 'hintless_hero',
                name: 'Hintless Hero',
                description: 'Completed 10 puzzles without using hints',
                icon: 'lightbulb-off',
                earnedAt: new Date().toISOString()
            });
            setBadgeEarned(true);
        }
    };

    const handlePuzzleChange = (index) => {
        if (index <= completedPuzzles.size) {
            setCurrentPuzzleIndex(index);
        }
    };

    const currentPuzzle = CHALLENGE_PUZZLES[currentPuzzleIndex];
    const PuzzleComponent = PUZZLE_COMPONENTS[currentPuzzle.type];
    const progress = Math.round((completedPuzzles.size / 10) * 100);

    if (showCompletion) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto px-4 py-12 text-center"
            >
                <div className="bg-white rounded-3xl p-12 shadow-2xl border border-brand-100">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Sparkles size={48} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-brand-900 mb-4">
                        Hintless Hero Unlocked!
                    </h1>
                    <p className="text-text-muted mb-8">
                        Amazing! You solved all 10 puzzles without any hints and earned the <strong>Hintless Hero</strong> badge!
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/leaderboard')}
                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            View Badge
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-brand-100 text-brand-900 rounded-xl font-bold hover:bg-brand-200 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-6xl mx-auto px-4 py-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/leaderboard')}
                        className="p-2 hover:bg-surface rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-brand-900 flex items-center gap-2">
                            <LightbulbOff className="text-emerald-500" />
                            Hintless Hero Challenge
                        </h1>
                        <p className="text-sm text-text-muted">Solve 10 puzzles without using hints</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {badgeEarned && (
                        <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                            <Award size={16} />
                            Earned
                        </div>
                    )}
                    <div className="text-right">
                        <p className="text-xs text-text-muted uppercase tracking-wider">Progress</p>
                        <p className="text-2xl font-bold text-emerald-500">{completedPuzzles.size}/10</p>
                    </div>
                </div>
            </div>

            {/* No Hints Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 mb-8 border border-emerald-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                    <LightbulbOff size={24} />
                </div>
                <div>
                    <h3 className="font-bold text-brand-900">No Hints Allowed</h3>
                    <p className="text-sm text-text-muted">Complete all puzzles using only your logic skills. Hint system is disabled for this challenge.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Puzzle Grid Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-brand-100">
                        <h3 className="text-sm font-bold text-brand-900 mb-4 uppercase tracking-wider">Puzzles</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {CHALLENGE_PUZZLES.map((puzzle, index) => {
                                const isCompleted = completedPuzzles.has(index);
                                const isCurrent = index === currentPuzzleIndex;
                                const isLocked = index > completedPuzzles.size;

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handlePuzzleChange(index)}
                                        disabled={isLocked}
                                        className={`
                                            aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all
                                            ${isCompleted ? 'bg-emerald-100 text-emerald-700' : ''}
                                            ${isCurrent ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : ''}
                                            ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:scale-110'}
                                            ${!isCompleted && !isCurrent && !isLocked ? 'bg-brand-50 text-brand-700' : ''}
                                        `}
                                    >
                                        {isLocked ? <Lock size={12} /> : isCompleted ? <CheckCircle size={14} /> : index + 1}
                                    </button>
                                );
                            })}
                        </div>
                        <div className="mt-4 pt-4 border-t border-brand-100">
                            <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-emerald-100 rounded"></div>
                                    <span>Solved</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-3 h-3 bg-primary rounded"></div>
                                    <span>Current</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Active Puzzle */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-100">
                        {/* Puzzle Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-2xl font-bold text-brand-900">Puzzle #{currentPuzzleIndex + 1}</span>
                                    <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">
                                        No Hints
                                    </span>
                                </div>
                                <p className="text-sm text-text-muted">{PUZZLE_NAMES[currentPuzzle.type]}</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-brand-100 rounded-xl">
                                <Clock size={18} className="text-brand-600" />
                                <span className="font-mono font-bold text-brand-900">
                                    {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Puzzle Component */}
                        <div className="min-h-[300px] mb-6">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentPuzzleIndex}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="w-full"
                                >
                                    {currentPuzzleState && (
                                        <PuzzleComponent
                                            puzzleState={currentPuzzleState}
                                            onUpdate={handleValueUpdate}
                                            isReadOnly={false}
                                        />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Status Message */}
                        <div className="w-full h-12 flex items-center justify-center mb-4">
                            <AnimatePresence mode="wait">
                                {statusMsg && (
                                    <motion.div
                                        key={statusMsg.text}
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-md
                                            ${statusMsg.type === 'error' ? 'bg-error/20 text-error' : 'bg-emerald-100 text-emerald-700'}
                                        `}
                                    >
                                        {statusMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                        {statusMsg.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-center">
                            <button
                                onClick={handleValidation}
                                className="px-12 py-4 bg-emerald-500 text-white rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                            >
                                SUBMIT ANSWER
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default HintlessHeroChallenge;
