import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Flame } from 'lucide-react';

/**
 * StreakShieldPopup - The "Save Your Streak" safety net.
 */
const StreakShieldPopup = ({ isOpen, onClose, onUseShield, streakCount }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-background/90 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="relative w-full max-w-sm bg-surface border-2 border-primary/30 rounded-[32px] p-8 text-center shadow-2xl"
                    >
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                            <motion.div
                                animate={{ 
                                    scale: [1, 1.1, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="w-24 h-24 bg-primary rounded-full flex items-center justify-center shadow-2xl shadow-primary/50"
                            >
                                <Shield size={48} className="text-white" />
                            </motion.div>
                        </div>

                        <div className="mt-8 mb-6">
                            <h2 className="text-3xl font-black text-text-main leading-tight mb-2">STREAK AT RISK!</h2>
                            <div className="flex items-center justify-center gap-2 text-primary font-mono font-bold uppercase tracking-widest text-xs">
                                <AlertTriangle size={14} />
                                <span>Critical System Warning</span>
                            </div>
                        </div>

                        <div className="bg-background/50 rounded-2xl p-4 mb-8 border border-white/5">
                            <div className="flex items-center justify-center gap-3 mb-1">
                                <Flame size={32} className="text-orange-500 animate-pulse" />
                                <span className="text-4xl font-black text-text-main">{streakCount}</span>
                            </div>
                            <p className="text-text-muted text-[10px] uppercase font-bold tracking-widest">Days of Dedication</p>
                        </div>

                        <p className="text-text-muted text-sm mb-8 leading-relaxed">
                            You missed a logic cycle yesterday. Use a <span className="text-primary font-bold">Logic Shield</span> to maintain your standing.
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={onUseShield}
                                className="w-full py-4 bg-primary text-white rounded-2xl font-black text-lg tracking-widest uppercase hover:scale-[1.02] transition-transform shadow-xl shadow-primary/20"
                            >
                                DEPLOY SHIELD
                            </button>
                            <button
                                onClick={onClose}
                                className="w-full py-3 text-text-muted font-bold text-sm uppercase tracking-widest hover:text-white transition-colors"
                            >
                                Accept Reset
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default StreakShieldPopup;
