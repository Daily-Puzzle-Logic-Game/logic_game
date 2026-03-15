import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, ArrowUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import RankBadge from '../ui/RankBadge';
import { playSound } from '../../utils/SoundManager';

const RankPromotionSplash = ({ newRank, isOpen, onClose }) => {
    const [phase, setPhase] = useState('ANNOUNCE'); // ANNOUNCE -> REVEAL -> DONE

    useEffect(() => {
        if (isOpen && newRank) {
            setPhase('ANNOUNCE');
            playSound('crystal_ding');
            
            const timer = setTimeout(() => {
                // Trigger sound at the START of the reveal phase
                playSound('royal_fanfare');
                setPhase('REVEAL');
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: [newRank.color, '#ffffff', '#4F46E5']
                });
            }, 800); // Reduced delay for tighter sync

            return () => clearTimeout(timer);
        }
    }, [isOpen, newRank]);

    if (!isOpen || !newRank) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/90 backdrop-blur-xl cursor-pointer"
                />

                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="relative z-10 flex flex-col items-center text-center max-w-lg"
                >
                    <AnimatePresence mode="wait">
                        {phase === 'ANNOUNCE' ? (
                            <motion.div 
                                key="announce"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="space-y-4"
                            >
                                <div className="inline-flex items-center gap-2 px-4 py-1 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 font-mono text-xs uppercase tracking-[0.3em]">
                                    <Activity className="animate-pulse" size={12} /> Signal_Detected
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none">
                                    RANK <br /> <span className="text-blue-500">PROMOTED.</span>
                                </h1>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="reveal"
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center relative"
                            >
                                {/* Anime Character - Background Decal */}
                                <motion.div
                                    initial={{ x: 100, opacity: 0, scale: 0.8 }}
                                    animate={{ 
                                        x: window.innerWidth < 1024 ? 0 : 0, 
                                        opacity: window.innerWidth < 1024 ? 0.2 : 1, 
                                        scale: window.innerWidth < 1024 ? 1.2 : 1 
                                    }}
                                    transition={{ 
                                        delay: 0.4, 
                                        type: "spring", 
                                        stiffness: 100,
                                        damping: 15
                                    }}
                                    className="absolute md:-right-40 top-1/2 left-1/2 md:left-auto -translate-x-1/2 md:translate-x-0 -translate-y-1/2 w-80 h-80 md:w-64 md:h-64 pointer-events-none z-0"
                                >
                                    <img 
                                        src="/assets/stickers/anime/girl_19.png" 
                                        alt="Promotion Character" 
                                        className="w-full h-full object-contain filter drop-shadow(0 20px 30px rgba(0,0,0,0.5))"
                                    />
                                </motion.div>

                                <RankBadge rank={newRank} size="xl" className="mb-8 relative z-10" />
                                
                                <motion.div 
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <h2 className="text-3xl font-black uppercase tracking-widest mb-2" style={{ color: newRank.color }}>
                                        {newRank.name} {newRank.subRank}
                                    </h2>
                                    <p className="text-zinc-400 font-mono text-sm uppercase tracking-[0.2em] mb-8">
                                        Access Level: {newRank.name.split(' ')[0]} // SECURED
                                    </p>
                                    
                                    <button 
                                        onClick={onClose}
                                        className="px-12 py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-blue-500 hover:text-white transition-all shadow-2xl"
                                    >
                                        Acknowledge
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

// Mock Activity icon if not imported
const Activity = ({ size, className }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
);

export default RankPromotionSplash;
