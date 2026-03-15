import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trophy, Target, CheckCircle, Clock, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGameEngine } from '../hooks/useGameEngine';
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

// Seeded random generator for consistent puzzles
class SeededRandom {
    constructor(seed) { this.seed = seed; }
    next() { this.seed = (this.seed * 9301 + 49297) % 233280; return this.seed / 233280; }
    range(min, max) { return Math.floor(this.next() * (max - min)) + min; }
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
    BINARY_LOGIC: BinaryLogicComponent, DEDUCTION_GRID: DeductionGridComponent,
    NUMBER_MATRIX: NumberMatrixComponent, PATTERN_MATCH: PatternMatchComponent,
    SEQUENCE_SOLVER: SequenceSolverComponent
};
const PUZZLE_GENERATORS = {
    BINARY_LOGIC: generateBinaryLogic, DEDUCTION_GRID: generateDeductionGrid,
    NUMBER_MATRIX: generateNumberMatrix, PATTERN_MATCH: generatePatternMatch,
    SEQUENCE_SOLVER: generateSequenceSolver
};
const PUZZLE_VALIDATORS = {
    BINARY_LOGIC: validateBinaryLogic, DEDUCTION_GRID: validateDeductionGrid,
    NUMBER_MATRIX: validateNumberMatrix, PATTERN_MATCH: validatePatternMatch,
    SEQUENCE_SOLVER: validateSequenceSolver
};
const PUZZLE_NAMES = {
    BINARY_LOGIC: 'Binary Logic', DEDUCTION_GRID: 'Deduction Grid',
    NUMBER_MATRIX: 'Number Matrix', PATTERN_MATCH: 'Pattern Match',
    SEQUENCE_SOLVER: 'Sequence Solver'
};

const generateChallengePuzzles = () => {
    const puzzles = [];
    for (let i = 0; i < 50; i++) {
        const seededRandom = new SeededRandom(1000 + i);
        const typeIndex = i % 5;
        const type = PUZZLE_TYPES[typeIndex];
        const generator = PUZZLE_GENERATORS[type];
        let difficulty;
        if (i < 15) difficulty = 'Easy';
        else if (i < 35) difficulty = 'Medium';
        else difficulty = 'Hard';
        puzzles.push({
            id: i + 1, type, difficulty, data: generator(seededRandom),
            timeLimit: difficulty === 'Easy' ? 120 : difficulty === 'Medium' ? 180 : 240
        });
    }
    return puzzles;
};
const CHALLENGE_PUZZLES = generateChallengePuzzles();

const PuzzleMasterChallenge = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { achievements } = useGameEngine();
    const activeId = user?.id || 'local_user';
    const localKey = `challenge_master_${activeId}`;

    const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
    const [completedPuzzles, setCompletedPuzzles] = useState(new Set());
    const [failedPuzzles, setFailedPuzzles] = useState(new Set());
    const [timeRemaining, setTimeRemaining] = useState(120);
    const [isActive, setIsActive] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);
    const [badgeEarned, setBadgeEarned] = useState(false);
    const [currentPuzzleState, setCurrentPuzzleState] = useState(null);
    const [statusMsg, setStatusMsg] = useState(null);

    // Check Cloud Database for Badge
    useEffect(() => {
        if (achievements?.find(a => a.id === 'puzzle_master')) {
            setBadgeEarned(true);
        }
    }, [achievements]);

    // Load progress from Local Storage
    useEffect(() => {
        const saved = localStorage.getItem(localKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            setCompletedPuzzles(new Set(parsed.completedPuzzles || []));
            setFailedPuzzles(new Set(parsed.failedPuzzles || []));
            setCurrentPuzzleIndex(parsed.currentPuzzleIndex || 0);
        }
    }, [localKey]);

    // Save progress to Local Storage
    const saveProgress = useCallback(() => {
        localStorage.setItem(localKey, JSON.stringify({
            completedPuzzles: Array.from(completedPuzzles),
            failedPuzzles: Array.from(failedPuzzles),
            currentPuzzleIndex
        }));
    }, [localKey, completedPuzzles, failedPuzzles, currentPuzzleIndex]);

    useEffect(() => {
        let interval;
        if (isActive && timeRemaining > 0) {
            interval = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        handlePuzzleFail();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, timeRemaining]);

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
            case 'NUMBER_MATRIX': result = validator(currentPuzzleState.grid, currentPuzzle.data.solution); break;
            case 'PATTERN_MATCH': result = validator(currentPuzzleState.grid, currentPuzzle.data.solution); break;
            case 'SEQUENCE_SOLVER': result = validator(currentPuzzleState.sequence[currentPuzzleState.index], currentPuzzle.data.solution); break;
            case 'DEDUCTION_GRID': result = validator(currentPuzzleState.gridState, currentPuzzle.data.solution); break;
            case 'BINARY_LOGIC': result = validator(currentPuzzleState.inputs, currentPuzzle.data.target, currentPuzzle.data.gates); break;
            default: result = { valid: false, message: "Unknown puzzle type." };
        }

        if (result.valid) {
            setStatusMsg({ type: 'success', text: result.message });
            setIsActive(false);
            const newCompleted = new Set(completedPuzzles);
            newCompleted.add(currentPuzzleIndex);
            setCompletedPuzzles(newCompleted);
            saveProgress();

            if (newCompleted.size === 50) {
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

    const handlePuzzleFail = () => {
        setIsActive(false);
        const newFailed = new Set(failedPuzzles);
        newFailed.add(currentPuzzleIndex);
        setFailedPuzzles(newFailed);
        saveProgress();
    };

    const awardBadge = async () => {
        if (!badgeEarned) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                    await axios.post(`${API_URL}/api/user/achievement`, {
                        badgeType: 'puzzle_master',
                        title: 'Milestone 6 Achieved',
                        message: 'Puzzle Master status unlocked! 50 puzzles successfully decrypted.'
                    }, { headers: { Authorization: `Bearer ${token}` } });
                }
            } catch (err) {
                console.error('Achievement Sync Error:', err);
            }
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
    const progress = Math.round((completedPuzzles.size / 50) * 100);

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
                        className="w-24 h-24 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Trophy size={48} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-brand-900 mb-4">
                        Challenge Complete!
                    </h1>
                    <p className="text-text-muted mb-8">
                        Congratulations! You've solved all 50 puzzles and earned the <strong>Puzzle Master</strong> badge!
                    </p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => navigate('/leaderboard')} className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors">
                            View Badge
                        </button>
                        <button onClick={() => navigate('/')} className="px-8 py-3 bg-brand-100 text-brand-900 rounded-xl font-bold hover:bg-brand-200 transition-colors">
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
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/leaderboard')} className="p-2 hover:bg-surface rounded-full transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-brand-900 flex items-center gap-2">
                            <Target className="text-amber-500" />
                            Puzzle Master Challenge
                        </h1>
                        <p className="text-sm text-text-muted">Solve 50 puzzles to earn the badge</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-xs text-text-muted uppercase tracking-wider">Progress</p>
                        <p className="text-2xl font-bold text-primary">{completedPuzzles.size}/50</p>
                    </div>
                    <div className="w-32 h-3 bg-brand-100 rounded-full overflow-hidden">
                        <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl p-4 shadow-lg border border-brand-100">
                        <h3 className="text-sm font-bold text-brand-900 mb-4 uppercase tracking-wider">Puzzle Map</h3>
                        <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto">
                            {CHALLENGE_PUZZLES.map((puzzle, index) => {
                                const isCompleted = completedPuzzles.has(index);
                                const isFailed = failedPuzzles.has(index);
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
                                            ${isFailed ? 'bg-red-100 text-red-700' : ''}
                                            ${isCurrent ? 'bg-primary text-white ring-2 ring-primary ring-offset-2' : ''}
                                            ${isLocked ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:scale-110'}
                                            ${!isCompleted && !isFailed && !isCurrent && !isLocked ? 'bg-brand-50 text-brand-700' : ''}
                                        `}
                                    >
                                        {isLocked ? <Lock size={12} /> : isCompleted ? <CheckCircle size={14} /> : index + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-100">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-2xl font-bold text-brand-900">Puzzle #{currentPuzzleIndex + 1}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700`}>
                                        {currentPuzzle.difficulty}
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

                        <div className="min-h-[300px] mb-6">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentPuzzleIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full">
                                    {currentPuzzleState && (
                                        <PuzzleComponent puzzleState={currentPuzzleState} onUpdate={handleValueUpdate} isReadOnly={false} />
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <div className="w-full h-12 flex items-center justify-center mb-4">
                            <AnimatePresence mode="wait">
                                {statusMsg && (
                                    <motion.div key={statusMsg.text} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-md bg-emerald-100 text-emerald-700">
                                        {statusMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                                        {statusMsg.text}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="flex justify-center">
                            <button onClick={handleValidation} className="px-12 py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-transform">
                                SUBMIT ANSWER
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PuzzleMasterChallenge;
