import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Grid3X3,
    Hash,
    Zap,
    Puzzle,
    BrainCircuit,
    ChevronRight,
    Gamepad2
} from 'lucide-react';
import { PUZZLE_TYPES } from '../config/puzzleTypes';

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
                    <h1 className="text-3xl font-bold text-text-main">Games Library</h1>
                    <p className="text-text-muted">Practice your skills across all logic categories.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {GAMES.map((game, index) => (
                    <motion.div
                        key={game.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5 }}
                    >
                        <Link
                            to={`/games/${game.id}`}
                            className="block bg-surface border border-surface/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-4 rounded-2xl bg-gradient-to-br ${game.color} text-white shadow-md`}>
                                    <game.icon size={28} />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full bg-background border border-surface text-text-muted">
                                    {game.diff}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-text-main mb-2 group-hover:text-primary transition-colors">
                                {game.title}
                            </h3>
                            <p className="text-sm text-text-muted leading-relaxed mb-6">
                                {game.description}
                            </p>

                            <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                Play Now
                                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default GamesLibrary;
