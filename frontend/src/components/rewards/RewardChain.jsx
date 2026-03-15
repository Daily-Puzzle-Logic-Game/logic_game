import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Flame, Trophy, Zap, Star } from 'lucide-react';
import AnimatedScore from '../effects/AnimatedScore';
import { playSound } from '../../utils/SoundManager';

const RewardStep = ({ icon: Icon, title, value, subValue, colorClass, animationDelay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 1.1, y: -20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20, delay: animationDelay }}
        className="flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-[3rem] shadow-2xl min-w-[300px]"
    >
        <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-2xl border-2 ${colorClass}`}>
            <Icon size={40} className="text-white" />
        </div>
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 mb-2">{title}</h3>
        <div className="text-5xl font-black text-white italic tracking-tighter flex items-center gap-3">
            {typeof value === 'number' ? <AnimatedScore value={value} /> : value}
            {subValue && <span className="text-lg opacity-40 font-mono italic">{subValue}</span>}
        </div>
    </motion.div>
);

const RewardChain = ({ isOpen, onClose, xpGained, streakCount, achievements = [] }) => {
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: CheckCircle2,
            title: 'Neural_Sync_Complete',
            value: 'SOLVED',
            colorClass: 'bg-emerald-600 border-emerald-400 shadow-emerald-500/20'
        },
        {
            icon: Flame,
            title: 'Progression_Streak',
            value: streakCount,
            subValue: 'DAYS',
            colorClass: 'bg-orange-600 border-orange-400 shadow-orange-500/20'
        },
        {
            icon: Zap,
            title: 'Energy_Harvested',
            value: xpGained,
            subValue: 'XP',
            colorClass: 'bg-blue-600 border-blue-400 shadow-blue-500/20'
        }
    ];

    // Add achievement step if any were unlocked
    if (achievements.length > 0) {
        steps.push({
            icon: Trophy,
            title: 'Data_Milestone_Unlocked',
            value: achievements[0].name,
            colorClass: 'bg-gold border-yellow-400 shadow-yellow-500/20'
        });
    }

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            playSound('bubble_pop'); // Initial solved state

            const interval = setInterval(() => {
                setStep(currentStep => {
                    const nextStep = currentStep + 1;
                    if (nextStep < steps.length) {
                        // Play sound IMMEDIATELY before starting the next step transition
                        if (nextStep === 1) playSound('crystal_ding');
                        if (nextStep === 2) playSound('sparkle_shine');
                        if (nextStep === 3) playSound('sparkle_shine');
                        return nextStep;
                    }
                    clearInterval(interval);
                    setTimeout(onClose, 2500); 
                    return currentStep;
                });
            }, 1400); // Slightly more time for animation to breathe
            
            return () => clearInterval(interval);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/80 backdrop-blur-md">
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[120px] rounded-full" />
                
                {/* Persistent Anime Character during rewards */}
                <motion.div
                    initial={{ x: 100, opacity: 0, scale: 0.8 }}
                    animate={{ x: 0, opacity: window.innerWidth < 1024 ? 0.3 : 1, scale: window.innerWidth < 1024 ? 0.8 : 1 }}
                    transition={{ type: "spring", damping: 15, delay: 0.2 }}
                    className="absolute right-[-40px] md:right-0 bottom-0 w-[280px] md:w-[400px] h-auto pointer-events-none z-0"
                >
                    <img 
                        src="/assets/stickers/anime/girl_19.png" 
                        alt="Victory Character" 
                        className="w-full h-full object-contain filter drop-shadow(0 0 30px rgba(0,0,0,0.4))"
                    />
                </motion.div>
            </div>

            <AnimatePresence mode="wait">
                <RewardStep key={step} {...steps[step]} />
            </AnimatePresence>

            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-12 text-[10px] font-black text-white/20 uppercase tracking-[0.5em] animate-pulse"
            >
                Synchronizing_Neural_Rewards...
            </motion.div>
        </div>
    );
};

export default RewardChain;
