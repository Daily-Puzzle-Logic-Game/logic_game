import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Zap, Flame, Award, Share2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { RARITY_CONFIG } from '../../config/achievements';

const ICON_MAP = {
    zap: Zap,
    star: Star,
    flame: Flame,
    award: Award
};

const AchievementCelebration = ({ achievement, isOpen, onClose }) => {
    const [phase, setPhase] = useState('entering'); // entering -> revealed

    useEffect(() => {
        if (isOpen) {
            setPhase('entering');
            const timer = setTimeout(() => {
                setPhase('revealed');
                triggerBurst();
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const triggerBurst = () => {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 300 };

        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    };

    if (!achievement) return null;

    const config = RARITY_CONFIG[achievement.rarity];
    const Icon = ICON_MAP[achievement.icon] || Star;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
                    {/* Dark Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
                    />

                    {/* Celebration Card */}
                    <div className="relative flex items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ scale: 0, rotate: -10, opacity: 0 }}
                            animate={{ scale: 1, rotate: 0, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className={`relative w-full max-w-sm bg-surface/50 backdrop-blur-2xl border-2 rounded-[48px] p-10 text-center shadow-2xl ${config.glow} pointer-events-auto`}
                        >
                            {/* Glow Burst Background */}
                            <motion.div 
                                animate={{ 
                                    scale: [1, 1.5, 1.2],
                                    opacity: [0.3, 0.6, 0.4]
                                }}
                                transition={{ repeat: Infinity, duration: 4 }}
                                className={`absolute inset-0 rounded-[48px] blur-[60px] ${config.text.replace('text-', 'bg-')}`}
                            />

                            <div className="relative z-10">
                                <motion.div
                                    animate={{ 
                                        scale: phase === 'revealed' ? [1, 1.1, 1] : 1,
                                        rotate: phase === 'revealed' ? [0, 5, -5, 0] : 0
                                    }}
                                    transition={{ duration: 0.5 }}
                                    className={`w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-surface to-background flex items-center justify-center mb-8 shadow-2xl border border-white/10`}
                                >
                                    <Icon size={64} className={`${config.text} drop-shadow-lg`} />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: phase === 'revealed' ? 1 : 0, y: phase === 'revealed' ? 0 : 10 }}
                                    className="space-y-4"
                                >
                                    <div className={`text-[12px] font-black uppercase tracking-[0.4em] ${config.text}`}>
                                        {achievement.rarity} Badge Unlocked
                                    </div>
                                    <h2 className="text-4xl font-black text-white tracking-tight leading-none">
                                        {achievement.name}
                                    </h2>
                                    <p className="text-text-muted font-bold text-sm px-4">
                                        {achievement.description}
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: phase === 'revealed' ? 1 : 0, y: phase === 'revealed' ? 0 : 20 }}
                                    transition={{ delay: 0.8 }}
                                    className="mt-12 flex flex-col gap-3"
                                >
                                    <button
                                        onClick={onClose}
                                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-lg transition-transform active:scale-95 bg-white text-black hover:bg-white/90`}
                                    >
                                        Claim Reward
                                    </button>
                                    <button className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white transition-colors">
                                        <Share2 size={14} /> Share Achievement
                                    </button>
                                </motion.div>
                            </div>
                        </motion.div>

                        {/* Anime Character Animation */}
                        <motion.div
                            initial={{ x: 300, opacity: 0, scale: 0.8 }}
                            animate={{ 
                                x: window.innerWidth < 768 ? 140 : 180, 
                                opacity: window.innerWidth < 768 ? 0.4 : 1, 
                                scale: window.innerWidth < 768 ? 0.8 : 1,
                                y: [-10, 10, -10]
                            }}
                            transition={{
                                x: { type: "spring", damping: 20, stiffness: 100, delay: 0.3 },
                                opacity: { duration: 0.5, delay: 0.3 },
                                y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
                            }}
                            className="absolute z-20"
                        >
                            <img 
                                src="/assets/stickers/anime/girl_19.png" 
                                alt="Celebration" 
                                className="w-[200px] md:w-[320px] h-auto drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] filter brightness-110"
                            />
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AchievementCelebration;
