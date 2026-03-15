import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, LightbulbOff, Trophy, CheckCircle, Clock, Award, Lock, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
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

// Seeded random generator
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

const generateHintlessPuzzles = () => {
    const puzzles = [];
    for (let i = 0; i < 10; i++) {
        const seededRandom = new SeededRandom(5000 + i);
        const typeIndex = i % 5;
        const type = PUZZLE_TYPES[typeIndex];
        const generator = PUZZLE_GENERATORS[type];

        puzzles.push({
            id: i + 1,
            type,
            difficulty: 'Medium',
            data: generator(seededRandom),
            timeLimit: 180
        });
    }
    return puzzles;
};

const CHALLENGE_PUZZLES = generateHintlessPuzzles();

const HintlessHeroChallenge = () => {
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { achievements } = useGameEngine();
    const activeId = user?.id || 'local_user';
    const localKey = `hintless_hero_${activeId}`;

    const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
    const [completedPuzzles, setCompletedPuzzles] = useState(new Set());
    const [timeRemaining, setTimeRemaining] = useState(180);
    const [isActive, setIsActive] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);
    const [badgeEarned, setBadgeEarned] = useState(false);
    const [currentPuzzleState, setCurrentPuzzleState] = useState(null);
    const [statusMsg, setStatusMsg] = useState(null);

    // Initial Badge Fetch
    useEffect(() => {
        if (achievements?.find(a => a.id === 'hintless_hero')) {
            setBadgeEarned(true);
        }
    }, [achievements]);

    // Load progress from Local Storage
    useEffect(() => {
        const saved = localStorage.getItem(localKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            setCompletedPuzzles(new Set(parsed.completedPuzzles || []));
            setCurrentPuzzleIndex(parsed.currentPuzzleIndex || 0);
        }
    }, [localKey]);

    // Save progress to Local Storage
    const saveProgress = useCallback(() => {
        localStorage.setItem(localKey, JSON.stringify({
            completedPuzzles: Array.from(completedPuzzles),
            currentPuzzleIndex
        }));
    }, [localKey, completedPuzzles, currentPuzzleIndex]);

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
        if (!badgeEarned) {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                    await axios.post(`${API_URL}/api/user/achievement`, {
                        badgeType: 'hintless_hero',
                        title: 'Milestone 5 Achieved',
                        message: 'Hintless Hero badge confirmed. Pure logic drive active.'
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

    if (showCompletion) {
        return (
            <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 industrial-grid opacity-20 pointer-events-none" />
                <div className="absolute inset-0 industrial-grid-sub opacity-10 pointer-events-none" />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-2xl w-full text-center relative z-10"
                >
                    <div className="glass-industrial rounded-[3rem] p-12 border border-blue-500/30 shadow-[0_40px_80px_rgba(0,0,0,0.8)]">
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15 }}
                            className="w-32 h-32 bg-blue-600/20 text-blue-400 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-blue-400/30 shadow-[0_0_30px_rgba(34,211,238,0.2)]"
                        >
                            <Sparkles size={64} className="animate-pulse" />
                        </motion.div>
                        <h1 className="text-5xl font-black text-white mb-6 uppercase tracking-tighter italic">
                            Hintless Hero <span className="text-blue-500">Unlocked</span>
                        </h1>
                        <p className="text-xl text-zinc-400 mb-10 leading-relaxed font-light">
                            Neural trajectory optimized. All 10 modules completed with <span className="text-white font-bold">zero external assistance</span>. Badge confirmed.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <button 
                                onClick={() => navigate('/leaderboard')} 
                                className="px-12 py-5 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-blue-500 transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)]"
                            >
                                View Badge Status
                            </button>
                            <button 
                                onClick={() => navigate('/')} 
                                className="px-12 py-5 bg-white/10 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-white/20 transition-all border border-white/10"
                            >
                                Core Dashboard
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-white relative py-12 px-6 overflow-hidden">
            {/* Background Architecture */}
            <div className="absolute inset-0 industrial-grid opacity-[0.05] pointer-events-none" />
            <div className="absolute inset-0 industrial-grid-sub opacity-[0.02] pointer-events-none" />
            
            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="flex flex-col md:flex-row items-center justify-between mb-12 gap-8"
                >
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/leaderboard')} className="p-4 glass-industrial rounded-2xl hover:bg-white/10 transition-all group border border-white/5">
                            <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <LightbulbOff size={28} className="text-blue-500" />
                                <h1 className="text-4xl font-black uppercase tracking-tighter italic">Hintless Hero</h1>
                            </div>
                            <p className="text-xs font-mono text-zinc-500 uppercase tracking-[0.3em]">Protocol // No_External_Assistance_Required</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-6 p-6 glass-industrial rounded-3xl border border-white/5">
                        <div className="text-right">
                            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-1">Efficiency_Index</p>
                            <p className="text-3xl font-black text-blue-500 tabular-nums">{(completedPuzzles.size / 10 * 100).toFixed(0)}%</p>
                        </div>
                        <div className="w-px h-10 bg-white/10" />
                        <div className="text-right">
                            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-[0.2em] mb-1">Node_Sync</p>
                            <p className="text-3xl font-black text-white tabular-nums">{completedPuzzles.size}/10</p>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-4 space-y-6">
                        {/* No Hints Warning */}
                        <div className="glass-industrial rounded-3xl p-6 border border-emerald-500/20 bg-emerald-500/[0.03]">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <h3 className="font-black text-emerald-400 uppercase text-sm tracking-widest mb-1 italic">Pure Logic Drive</h3>
                                    <p className="text-xs text-zinc-500 leading-relaxed font-light">Hint system deactivated for this protocol. Direct neural processing active.</p>
                                </div>
                            </div>
                        </div>

                        {/* Puzzle Navigation */}
                        <div className="glass-industrial rounded-[2.5rem] p-8 border border-white/5 shadow-2xl">
                             <h3 className="text-[10px] font-mono font-black text-zinc-600 mb-8 uppercase tracking-[0.4em] flex items-center gap-2">
                                <Terminal size={12} /> Sync_Status
                             </h3>
                             <div className="grid grid-cols-5 gap-4">
                                 {CHALLENGE_PUZZLES.map((puzzle, index) => {
                                     const isCompleted = completedPuzzles.has(index);
                                     const isCurrent = index === currentPuzzleIndex;
                                     const isLocked = index > completedPuzzles.size;
                                     return (
                                         <button
                                             key={index} 
                                             onClick={() => handlePuzzleChange(index)} 
                                             disabled={isLocked}
                                             className={`aspect-square rounded-xl flex items-center justify-center text-sm font-black transition-all relative group
                                                 ${isCompleted ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : ''}
                                                 ${isCurrent ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)] border border-blue-400/50 scale-110 z-10' : ''}
                                                 ${isLocked ? 'bg-zinc-900 text-zinc-800 cursor-not-allowed border border-white/5' : 'bg-white/[0.03] text-zinc-400 border border-white/5 hover:bg-white/[0.08] hover:scale-105'}
                                                 ${!isCompleted && !isCurrent && !isLocked ? '' : ''}`}
                                         >
                                             {isLocked ? <Lock size={14} /> : isCompleted ? <CheckCircle size={16} /> : index + 1}
                                             {isCurrent && (
                                                <motion.div 
                                                    layoutId="outline"
                                                    className="absolute -inset-2 border border-blue-500/30 rounded-2xl pointer-events-none"
                                                    initial={false}
                                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                                />
                                             )}
                                         </button>
                                     );
                                 })}
                             </div>
                        </div>

                        {/* Global Progress */}
                        <div className="glass-industrial rounded-[2.5rem] p-8 border border-white/5">
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Global_Progression</span>
                                <span className="text-xs font-mono text-zinc-400">{completedPuzzles.size * 10}%</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${completedPuzzles.size * 10}%` }}
                                    className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="glass-industrial rounded-[3.5rem] p-10 border border-white/5 shadow-[0_40px_80px_rgba(0,0,0,0.6)] relative overflow-hidden">
                            {/* Inner Scanline Effect */}
                            <div className="absolute inset-0 scanline-overlay opacity-[0.03] pointer-events-none" />
                            
                            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-6 relative z-10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                                        <span className="text-[10px] font-mono text-blue-500 uppercase tracking-[0.4em]">Active_Simulation</span>
                                    </div>
                                    <h2 className="text-3xl font-black uppercase tracking-tight italic">Module_{currentPuzzleIndex + 1}</h2>
                                    <p className="text-sm font-light text-zinc-500">{PUZZLE_NAMES[currentPuzzle.type]}</p>
                                </div>
                                <div className="flex items-center gap-4 px-8 py-4 bg-zinc-900/50 border border-white/5 rounded-[2rem] shadow-inner">
                                    <Clock size={24} className="text-blue-500" />
                                    <span className="font-mono text-4xl font-black text-white tabular-nums tracking-tighter">
                                        {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                                    </span>
                                </div>
                            </div>

                            {/* Puzzle Area */}
                            <div className="min-h-[400px] mb-10 p-8 bg-black/20 rounded-[2.5rem] border border-white/5 relative group transition-all hover:bg-black/30">
                                <AnimatePresence mode="wait">
                                    <motion.div 
                                        key={currentPuzzleIndex} 
                                        initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }} 
                                        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} 
                                        exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }} 
                                        className="w-full flex items-center justify-center"
                                    >
                                        {currentPuzzleState && (
                                            <div className="w-full max-w-lg">
                                                <PuzzleComponent puzzleState={currentPuzzleState} onUpdate={handleValueUpdate} isReadOnly={false} />
                                            </div>
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                                
                                {/* Status Messages */}
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full px-8 pointer-events-none">
                                    <AnimatePresence mode="wait">
                                        {statusMsg && (
                                            <motion.div 
                                                key={statusMsg.text} 
                                                initial={{ opacity: 0, y: 10, scale: 0.9 }} 
                                                animate={{ opacity: 1, y: 0, scale: 1 }} 
                                                exit={{ opacity: 0, y: -10, scale: 0.9 }} 
                                                className={`mx-auto flex items-center justify-center gap-3 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-2xl backdrop-blur-xl border ${statusMsg.type === 'error' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}
                                            >
                                                {statusMsg.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                                                {statusMsg.text}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="flex justify-center relative z-10">
                                <motion.button 
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleValidation} 
                                    className="group relative px-20 py-7 bg-blue-600 rounded-[2rem] font-black uppercase tracking-[0.4em] text-sm overflow-hidden transition-all shadow-[0_20px_40px_rgba(59,130,246,0.3)] border border-blue-400/30"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <span className="relative flex items-center gap-4">
                                        Establish_Solution <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                    </span>
                                </motion.button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* System Status Decorative Corner */}
            <div className="fixed bottom-12 right-12 pointer-events-none opacity-20 hidden md:flex flex-col items-end gap-2 font-mono text-[9px] uppercase tracking-[0.5em] text-zinc-600">
                <span>Core_Control_System_V5</span>
                <span>Neural_Sync_Active</span>
            </div>
        </div>
    );
};

export default HintlessHeroChallenge;
