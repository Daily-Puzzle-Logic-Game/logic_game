import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Zap, Star, Flame, ShieldCheck } from 'lucide-react';
import { RARITY_CONFIG } from '../../config/achievements';

const ICON_MAP = {
    zap: Zap,
    star: Star,
    flame: Flame,
    'shield-check': ShieldCheck,
    award: Award
};

const BadgeModal = ({ isOpen, achievement, onClose }) => {
    const canvasRef = useRef(null);
    const config = achievement ? RARITY_CONFIG[achievement.rarity] : null;
    const Icon = achievement ? (ICON_MAP[achievement.icon] || Star) : Star;

    useEffect(() => {
        if (!isOpen || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const particles = [];
        const particleCount = 100;
        const colors = achievement.rarity === 'Legendary' 
            ? ['#F472B6', '#8B5CF6', '#3B82F6'] 
            : achievement.rarity === 'Epic' 
                ? ['#8B5CF6', '#6366F1'] 
                : ['#3B82F6', '#22D3EE'];

        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 3 + 1,
                color: colors[Math.floor(Math.random() * colors.length)],
                alpha: 1
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = p.alpha;
                ctx.fill();

                p.x += p.vx;
                p.y += p.vy;
                p.alpha -= 0.01;

                if (p.alpha <= 0) {
                    particles.splice(i, 1);
                    i--;
                }
            }
            if (particles.length > 0) {
                animationFrameId = requestAnimationFrame(draw);
            }
        };

        draw();
        return () => cancelAnimationFrame(animationFrameId);
    }, [isOpen, achievement]);

    if (!achievement) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-xl"
                    />

                    {/* Particle Canvas */}
                    <canvas 
                        ref={canvasRef} 
                        className="absolute inset-0 pointer-events-none"
                    />

                    {/* Modal Content */}
                    <motion.div
                        key={achievement?.id}
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        className="relative w-full max-w-lg bg-surface/30 border border-white/10 rounded-[48px] p-12 shadow-2xl z-20"
                    >
                        {/* Energy Rings */}
                        <motion.div 
                            animate={{ rotate: 360 }}
                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 -m-12 border-2 border-dashed border-blue-500/10 rounded-full pointer-events-none"
                        />
                        <motion.div 
                            animate={{ rotate: -360 }}
                            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-4 -m-12 border border-dashed border-cyan/10 rounded-full pointer-events-none"
                        />

                        {/* Background Assistant (Trophy) - Ultra Zoomed Backdrop */}
                        <motion.div 
                            initial={{ opacity: 0, scale: 1.4, y: 100 }}
                            animate={{ opacity: 0.3, scale: 1.2, y: 50 }}
                            transition={{ delay: 0.2, duration: 2, ease: "easeOut" }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none"
                        >
                            <img 
                                src="/assets/stickers/assistant_trophy.png" 
                                alt="" 
                                className="w-[850px] min-w-[850px] h-auto object-cover opacity-50 grayscale-[20%] brightness-75 blur-[1px]"
                            />
                        </motion.div>



                        {/* Rarity Glow Background */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 blur-[100px] opacity-25 -z-10 ${config.bg || 'bg-primary'}`} />

                        <button 
                            onClick={onClose}
                            className="absolute top-8 right-8 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors z-[60]"
                        >
                            <X size={20} className="text-white/60" />
                        </button>

                        <div className="flex flex-col items-center text-center relative z-10">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="relative mb-8"
                            >
                                <div className={`w-32 h-32 rounded-[40px] flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border border-white/20 shadow-2xl relative z-10 ${config.glow}`}>
                                    <Icon size={64} className={`${config.text} fill-current`} />
                                </div>
                                {/* Halo below icon */}
                                <div className={`absolute -inset-4 blur-3xl opacity-50 rounded-full ${config.bg || 'bg-primary'}`} />
                            </motion.div>

                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-4 w-full"
                            >
                                <div>
                                    <span className={`text-xs font-black uppercase tracking-[0.4em] ${config.text}`}>
                                        {achievement.rarity} Achievement
                                    </span>
                                    <h2 className="text-4xl font-black text-white tracking-tight mt-2">
                                        {achievement.name}
                                    </h2>
                                </div>

                                <p className="text-sm text-text-muted max-w-xs mx-auto leading-relaxed px-4">
                                    {achievement.description}
                                </p>

                                <div className="pt-8 flex justify-center">
                                    <button 
                                        onClick={onClose}
                                        className="px-16 py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                                    >
                                        Acknowledge
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BadgeModal;
