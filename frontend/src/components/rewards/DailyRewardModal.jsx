import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, CheckCircle2, Sparkles, Zap, Shield, Flame } from 'lucide-react';
import { useEngagement } from '../../hooks/useEngagement';
import { triggerRewardConfetti } from '../effects/ConfettiManager';
import { playSound } from '../../utils/SoundManager';

/**
 * DailyRewardModal - The 7-day habit loop popup.
 */
const DailyRewardModal = ({ isOpen, onClose, onClaim }) => {
    const { getDailyRewardSchedule } = useEngagement();
    const [rewardStatus, setRewardStatus] = useState({ 
        canClaim: false, 
        isClaimedToday: false, 
        currentStreak: 0 
    });

    const [isClaiming, setIsClaiming] = useState(false);

    const schedule = getDailyRewardSchedule();
    const todayStr = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (isOpen) {
            fetchRewardStatus();
        }
    }, [isOpen]);

    const fetchRewardStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await axios.get(`${API_URL}/api/rewards/status`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRewardStatus(res.data);
        } catch (err) {
            console.error('Failed to fetch reward status:', err);
        }
    };

    const handleClaim = async () => {
        playSound('bubble_pop'); // Immediate gesture-triggered sound to wake up AudioContext
        setIsClaiming(true);
        try {
            const token = localStorage.getItem('token');
            const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const res = await axios.post(`${API_URL}/api/rewards/claim`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const { newStreak, rewardPoints, totalPoints } = res.data;
            
            triggerRewardConfetti(newStreak % 7 === 0 ? 'premium' : 'mid');
            
            if (onClaim) {
                const reward = schedule[(newStreak - 1) % 7];
                onClaim({ ...reward, points: rewardPoints, totalPoints });
            }

            setRewardStatus(prev => ({
                ...prev,
                isClaimedToday: true,
                canClaim: false,
                currentStreak: newStreak
            }));

            setTimeout(() => {
                setIsClaiming(false);
                onClose();
            }, 3000);

        } catch (err) {
            console.error('Claim failed:', err);
            setIsClaiming(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'zap': return <Zap className="text-yellow-400" size={20} />;
            case 'sparkles': return <Sparkles className="text-cyan-400" size={20} />;
            case 'flame': return <Flame className="text-orange-500" size={20} />;
            case 'shield': return <Shield className="text-blue-400" size={20} />;
            case 'gift': return <Gift className="text-purple-400" size={20} />;
            default: return <Gift size={20} />;
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, y: 50, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.9, y: 50, opacity: 0 }}
                        className="relative w-full max-w-md bg-surface border border-white/10 rounded-3xl shadow-2xl"
                    >
                        {/* Background Decor - Subtle Glow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 blur-[100px] pointer-events-none rounded-full overflow-hidden" />

                        {/* Mascot Guide - Bottom Left Peeking & Reactive */}
                        <div className="absolute -left-48 -bottom-16 z-20 pointer-events-none hidden sm:block">
                            <AnimatePresence mode="wait">
                                {!isClaiming ? (
                                    <motion.img 
                                        key="pointing"
                                        initial={{ x: -100, opacity: 0, rotate: -20 }}
                                        animate={{ x: 20, opacity: 1, rotate: 10 }}
                                        exit={{ x: -100, opacity: 0 }}
                                        src="/assets/stickers/assistant_pointing.png" 
                                        alt="Guide" 
                                        className="w-60 h-auto drop-shadow-2xl"
                                    />
                                ) : (
                                    <motion.div
                                        key="cheer"
                                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                                        animate={{ scale: 1, opacity: 1, y: -50 }}
                                        className="relative"
                                    >
                                        <img 
                                            src="/assets/stickers/happy , excitement.gif" 
                                            alt="Celebration" 
                                            className="w-72 h-auto drop-shadow-[0_0_40px_rgba(var(--primary-rgb),0.5)]"
                                        />
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="absolute -top-16 -right-4 bg-primary text-white text-xs font-black px-6 py-2 rounded-full shadow-2xl whitespace-nowrap rotate-6 border-2 border-white/20"
                                        >
                                            REWARD SECURED! 🎊
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Victory Effect during claim */}
                        <AnimatePresence>
                            {isClaiming && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-10 pointer-events-none bg-primary/5 backdrop-blur-[2px]"
                                />
                            )}
                        </AnimatePresence>

                        <div className="p-8 relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-3 bg-accent/20 rounded-2xl text-accent">
                                    <Gift size={28} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black tracking-tight text-text-main leading-none">Daily Supply Drop</h2>
                                    <p className="text-text-muted text-sm mt-1 uppercase tracking-widest font-bold">Protocol: Retention Loop 7</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-3 mb-8">
                                {schedule.map((day, idx) => {
                                    const isCurrent = (rewardStatus.currentStreak % 7) === idx;
                                    const isPast = (rewardStatus.currentStreak % 7) > idx;

                                    return (
                                        <motion.div
                                            key={day.day}
                                            whileHover={!rewardStatus.isClaimedToday && isCurrent ? { scale: 1.05 } : {}}
                                            className={`
                                                relative p-3 rounded-2xl border flex flex-col items-center justify-center aspect-square gap-1 transition-all
                                                ${isCurrent && !rewardStatus.isClaimedToday ? 'bg-accent/10 border-accent shadow-[0_0_15px_rgba(var(--accent-rgb),0.2)]' : 'bg-background/50 border-white/5'}
                                                ${isPast ? 'opacity-50 grayscale' : ''}
                                            `}
                                        >
                                            <span className="text-[10px] font-mono text-text-muted uppercase">Day {day.day}</span>
                                            {getIcon(day.icon)}
                                            <span className="text-[8px] font-bold text-center mt-1 leading-tight">{day.reward}</span>
                                            
                                            {isPast && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-background/20 rounded-2xl">
                                                    <CheckCircle2 size={16} className="text-accent" />
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>

                            <button
                                onClick={handleClaim}
                                disabled={rewardStatus.isClaimedToday || isClaiming}
                                className={`
                                    w-full py-4 rounded-2xl font-black text-lg tracking-widest uppercase transition-all shadow-lg
                                    ${(rewardStatus.isClaimedToday || isClaiming)
                                        ? 'bg-surface-light text-text-muted cursor-not-allowed' 
                                        : 'bg-primary hover:scale-[1.02] active:scale-95 shadow-primary/20 hover:shadow-primary/40'
                                    }
                                `}
                            >
                                {isClaiming ? "SYNCING..." : rewardStatus.isClaimedToday ? "PROTOCOL SYNCED" : "INITIATE CLAIM"}
                            </button>
                            
                            <p className="text-center text-[10px] text-text-muted mt-4 font-mono uppercase tracking-widest">
                                {rewardStatus.isClaimedToday ? "Check back tomorrow for Day " + ((rewardStatus.currentStreak % 7) + 1) : "Maintain your streak for greater rewards"}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DailyRewardModal;
