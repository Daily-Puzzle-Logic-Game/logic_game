import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

/**
 * ProgressBar - Smooth filling bar with milestone indicators.
 */
const ProgressBar = ({ progress }) => {
    const milestones = [25, 50, 75, 100];
    const safeProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className="w-full relative py-2">
            {/* Background Track */}
            <div className="h-3 w-full bg-surface/30 backdrop-blur-md rounded-full overflow-hidden border border-white/10 relative shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)]">
                {/* Fill Bar */}
                <motion.div
                    className="h-full bg-gradient-to-r from-gold via-orange to-gold relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${safeProgress}%` }}
                    transition={{ type: 'spring', stiffness: 50, damping: 20 }}
                >
                    {/* Animated Shine Sweep */}
                    <motion.div
                        animate={{ x: ['-100%', '200%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent w-20"
                    />
                    
                    {/* Glow Tip */}
                    <div className="absolute right-0 top-0 h-full w-4 bg-white/50 blur-md" />
                </motion.div>
            </div>

            {/* Milestones */}
            <div className="absolute -top-1 left-0 w-full flex justify-between px-0.5 pointer-events-none">
                {milestones.map((m) => {
                    const isReached = safeProgress >= m;
                    return (
                        <div key={m} className="flex flex-col items-center relative" style={{ left: `${m === 100 ? 0 : 0}%` }}>
                            <motion.div
                                animate={isReached ? {
                                    scale: [1, 1.4, 1],
                                    filter: m === 100 ? 'drop-shadow(0 0 15px gold)' : 'none'
                                } : {}}
                                className={`${isReached ? 'text-gold' : 'text-white/20'}`}
                            >
                                <Star 
                                    size={14} 
                                    fill={isReached ? 'currentColor' : 'none'}
                                    className={`${isReached ? (m === 100 ? 'animate-glow-pulse' : 'animate-bounce-soft') : ''}`}
                                />
                            </motion.div>
                        </div>
                    );
                })}
            </div>
            
            <div className="flex justify-between mt-3 px-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gold text-shadow-glow">Mastery_Level</span>
                    <div className={`w-1.5 h-1.5 rounded-full ${safeProgress === 100 ? 'bg-gold animate-ping' : 'bg-white/20'}`} />
                </div>
                <span className="text-xs font-black font-mono text-white tracking-widest">{Math.floor(safeProgress)}%</span>
            </div>
        </div>
    );
};

export default ProgressBar;
