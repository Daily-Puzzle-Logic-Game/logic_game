import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Zap, Star, Flame, ShieldCheck, Award } from 'lucide-react';
import { RARITY_CONFIG } from '../../config/achievements';
import ProgressRing from './ProgressRing';

const ICON_MAP = {
    zap: Zap,
    star: Star,
    flame: Flame,
    'shield-check': ShieldCheck,
    award: Award
};

const BadgeCard = ({ 
    achievement, 
    isLocked = true, 
    progress = 0, 
    isMajor = false 
}) => {
    const config = RARITY_CONFIG[achievement.rarity];
    const Icon = ICON_MAP[achievement.icon] || Star;

    const isLegendary = achievement.rarity === 'Legendary';
    const isEpic = achievement.rarity === 'Epic';

    return (
        <motion.div
            whileHover={!isLocked ? { y: -8, scale: 1.05 } : {}}
            className={`
                relative bg-surface/40 backdrop-blur-xl border rounded-[32px] p-6 transition-all duration-300 group
                ${!isLocked ? config.glow : 'border-white/5 opacity-60 grayscale'}
            `}
        >
            {/* Legendary Rotating Halo */}
            {!isLocked && isLegendary && (
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute inset-0 rounded-[32px] border-2 border-dashed border-pink-500/20 pointer-events-none"
                />
            )}

            {/* Legendary Floating Animation */}
            <motion.div
                animate={!isLocked && isLegendary ? { y: [0, -5, 0] } : {}}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="flex flex-col items-center text-center"
            >
                <div className="relative mb-4">
                    {/* Progress Ring for Major Milestones */}
                    {isMajor && (
                        <div className="absolute -inset-2">
                            <ProgressRing 
                                radius={44} 
                                stroke={3} 
                                progress={progress} 
                                color={!isLocked ? `stroke-${achievement.rarity === 'Legendary' ? 'pink-500' : 'primary'}` : 'stroke-white/10'}
                                glow={!isLocked}
                            />
                        </div>
                    )}

                    <div className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center relative z-10
                        ${!isLocked ? `bg-gradient-to-br from-surface to-background shadow-lg` : 'bg-white/5'}
                    `}>
                        {isLocked ? (
                            <Lock size={24} className="text-text-muted" />
                        ) : (
                            <motion.div
                                animate={isEpic || isLegendary ? { 
                                    filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
                                } : {}}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Icon size={32} className={`${config.text} fill-current opacity-80`} />
                            </motion.div>
                        )}
                        
                        {/* Shine sweep for Epic/Legendary */}
                        {!isLocked && (isEpic || isLegendary) && (
                            <motion.div 
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", repeatDelay: 1 }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                            />
                        )}
                    </div>
                </div>

                <div className="space-y-1">
                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${config.text}`}>
                        {achievement.rarity}
                    </span>
                    <h3 className="text-lg font-black text-text-main tracking-tight leading-tight">
                        {achievement.name}
                    </h3>
                    <p className="text-[10px] text-text-muted font-bold leading-tight line-clamp-2 px-2">
                        {achievement.description}
                    </p>
                </div>

                {/* Locked Progress View */}
                {isLocked && (
                    <div className="mt-4 w-full">
                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-text-muted mb-1 px-1">
                            <span>Progress</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-text-muted/30 rounded-full"
                            />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Rainbow glow for legendary */}
            {!isLocked && isLegendary && (
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-[34px] blur-xl opacity-10 -z-10 group-hover:opacity-20 transition-opacity" />
            )}
        </motion.div>
    );
};

export default BadgeCard;
