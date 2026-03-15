import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trophy, RotateCcw, ArrowRightCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * SessionExtender - Post-game intervention to increase session time.
 */
const SessionExtender = ({ isOpen, onClose, onAction }) => {
    const navigate = useNavigate();

    const handleAction = (path) => {
        onClose();
        if (path === 'reload') {
            window.location.reload();
        } else {
            navigate(path);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/60 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-surface border border-white/10 rounded-[40px] p-8 shadow-2xl"
                    >
                        <h2 className="text-2xl font-black text-center text-text-main mb-6 tracking-tight">System Optimized. Continue?</h2>
                        
                        <div className="space-y-4">
                            <button
                                onClick={() => handleAction('reload')}
                                className="w-full flex items-center justify-between p-4 bg-primary/20 border border-primary/30 rounded-2xl hover:bg-primary/30 transition-all group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary rounded-xl text-white">
                                        <Play size={20} fill="currentColor" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-black uppercase text-primary tracking-widest">Next Puzzle</div>
                                        <div className="text-[10px] text-text-muted font-bold">Try today's Pattern Match</div>
                                    </div>
                                </div>
                                <ArrowRightCircle size={20} className="text-primary group-hover:translate-x-1 transition-transform" />
                            </button>

                            <button
                                onClick={() => handleAction('/')}
                                className="w-full flex items-center gap-3 p-4 bg-background/50 border border-white/5 rounded-2xl hover:bg-background transition-all"
                            >
                                <div className="p-2 bg-surface-light rounded-xl text-text-muted">
                                    <RotateCcw size={20} />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-black uppercase text-text-main tracking-widest">Practice Mode</div>
                                    <div className="text-[10px] text-text-muted font-bold">Sharpen your logic core</div>
                                </div>
                            </button>

                            <button
                                onClick={() => handleAction('/leaderboard')}
                                className="w-full flex items-center gap-3 p-4 bg-background/50 border border-white/5 rounded-2xl hover:bg-background transition-all"
                            >
                                <div className="p-2 bg-accent/20 rounded-xl text-accent">
                                    <Trophy size={20} fill="currentColor" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-black uppercase text-accent tracking-widest">Leaderboard</div>
                                    <div className="text-[10px] text-text-muted font-bold">See your global standing</div>
                                </div>
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            className="mt-6 w-full text-text-muted font-bold text-[10px] uppercase tracking-[0.2em] hover:text-white transition-colors"
                        >
                            Back to Profile
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default SessionExtender;
