import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Grid3X3,
    Hash,
    Zap,
    Puzzle,
    BrainCircuit,
    ChevronRight,
    Gamepad2,
    Lock
} from 'lucide-react';
import { PUZZLE_TYPES, UNLOCK_REQUIREMENTS } from '../config/puzzleTypes';
import { useEngagement } from '../hooks/useEngagement';
import { useGameEngine } from '../hooks/useGameEngine';


const GAMES = [
    {
        id: PUZZLE_TYPES.NUMBER_MATRIX,
        title: 'Number Matrix',
        description: 'A numeric logic puzzle where rows and columns must contain unique digits.',
        icon: Hash,
        color: 'from-blue-500 to-indigo-600',
        diff: 'Intermediate'
    },
    {
        id: PUZZLE_TYPES.PATTERN_MATCH,
        title: 'Pattern Match',
        description: 'Visualize and complete complex symmetric or repeating patterns.',
        icon: Grid3X3,
        color: 'from-purple-500 to-pink-600',
        diff: 'Beginner'
    },
    {
        id: PUZZLE_TYPES.SEQUENCE_SOLVER,
        title: 'Sequence Solver',
        description: 'Find the hidden mathematical rule connecting a series of numbers.',
        icon: Zap,
        color: 'from-amber-400 to-orange-500',
        diff: 'Easy'
    },
    {
        id: PUZZLE_TYPES.DEDUCTION_GRID,
        title: 'Deduction Grid',
        description: 'Use logical clues to map relationships between different categories.',
        icon: Puzzle,
        color: 'from-green-500 to-emerald-600',
        diff: 'Hard'
    },
    {
        id: PUZZLE_TYPES.BINARY_LOGIC,
        title: 'Binary Logic',
        description: 'Complete logic gate circuits by determining the correct bit inputs.',
        icon: BrainCircuit,
        color: 'from-cyan-500 to-blue-600',
        diff: 'Expert'
    }
];

const GamesLibrary = () => {
    const { user } = useGameEngine();
    const { solvedCount, isModeUnlocked } = useEngagement(user);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto p-4 md:p-8"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-primary/10 rounded-2xl">
                    <Gamepad2 className="text-primary w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-text-main leading-tight">Arcade Mode</h1>
                    <p className="text-text-muted text-xs uppercase tracking-widest font-bold">Training sessions completed: {solvedCount}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {GAMES.map((game, index) => {
                    const unlocked = isModeUnlocked(game.id);
                    const unlockReq = UNLOCK_REQUIREMENTS[game.id];

                    return (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Link
                                to={unlocked ? `/games/${game.id}` : '#'}
                                className={`
                                    block bg-surface border rounded-[32px] p-6 shadow-lg transition-all group relative overflow-hidden
                                    ${unlocked ? 'border-surface/50 hover:shadow-primary/5 hover:border-primary/20' : 'opacity-70 grayscale border-dashed border-white/10 cursor-not-allowed'}
                                `}
                                onClick={(e) => !unlocked && e.preventDefault()}
                            >
                                {!unlocked && (
                                    <div className="absolute inset-0 z-20 bg-background/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                                        <div className="bg-surface p-4 rounded-full shadow-2xl border border-white/5 mb-3">
                                            <Lock size={24} className="text-text-muted" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted bg-surface/80 px-4 py-1 rounded-full border border-white/5">
                                            Solve {unlockReq} Puzzles to Unlock
                                        </span>
                                    </div>
                                )}

                                {/* Glow Effect on Hover */}
                                {unlocked && (
                                    <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 from-primary via-transparent to-transparent transition-opacity" />
                                )}

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <motion.div 
                                        whileHover={unlocked ? { rotate: [0, -10, 10, 0] } : {}}
                                        className={`p-4 rounded-2xl bg-gradient-to-br ${game.color} text-white shadow-lg`}
                                    >
                                        <game.icon size={28} />
                                    </motion.div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-background/50 border border-white/5 text-text-muted backdrop-blur-sm">
                                        {game.diff}
                                    </span>
                                </div>

                                <div className="relative z-10">
                                    <h3 className="text-2xl font-black text-text-main mb-2 tracking-tight flex items-center gap-2">
                                        {game.title}
                                        {unlocked && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="w-2 h-2 rounded-full bg-primary"
                                            />
                                        )}
                                    </h3>
                                    <p className="text-sm text-text-muted leading-relaxed mb-6 font-medium">
                                        {game.description}
                                    </p>

                                    {unlocked ? (
                                        <div className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest">
                                            Initiate Test
                                            <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    ) : (
                                        <div className="h-4" />
                                    )}
                                </div>
                            </Link>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
};


export default GamesLibrary;
