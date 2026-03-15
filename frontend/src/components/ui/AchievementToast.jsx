import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Zap, Star, Flame, X } from 'lucide-react';

const ICON_MAP = {
    zap: Zap,
    star: Star,
    flame: Flame,
    award: Award
};

const AchievementToast = ({ achievement, show, onClose }) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(onClose, 4000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    const Icon = ICON_MAP[achievement.icon] || Award;

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8, x: 50 }}
                    className="fixed top-6 right-6 z-[200] flex items-center gap-4 bg-surface/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/50 overflow-hidden"
                >
                    {/* Animated Glow Backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
                    
                    <div className="relative z-10 p-3 bg-primary rounded-xl text-white shadow-glow-primary">
                        <Icon size={24} />
                    </div>

                    <div className="relative z-10 flex-grow pr-4">
                        <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-0.5">Achievement Unlocked</div>
                        <h4 className="text-sm font-black text-text-main tracking-tight leading-tight">{achievement.name}</h4>
                        <p className="text-[10px] text-text-muted font-bold">{achievement.description}</p>
                    </div>

                    <button 
                        onClick={onClose}
                        className="relative z-10 p-1 hover:bg-white/5 rounded-lg text-text-muted transition-colors"
                    >
                        <X size={16} />
                    </button>

                    {/* Sweep Highlight */}
                    <motion.div 
                        initial={{ x: '-100%' }}
                        animate={{ x: '200%' }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AchievementToast;
