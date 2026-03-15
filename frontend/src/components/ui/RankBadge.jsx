import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star } from 'lucide-react';
import * as PremiumIcons from './RankIcons';

const RANK_COMPONENT_MAP = {
    'Bronze': PremiumIcons.BronzeIcon,
    'Silver': PremiumIcons.SilverIcon,
    'Gold': PremiumIcons.GoldIcon,
    'Platinum': PremiumIcons.PlatinumIcon,
    'Diamond': PremiumIcons.DiamondIcon,
    'Heroic': PremiumIcons.HeroicIcon,
    'Elite Heroic': PremiumIcons.HeroicIcon,
    'Master': PremiumIcons.MasterIcon,
    'Elite Master': PremiumIcons.MasterIcon,
    'Grand Master': PremiumIcons.GrandMasterIcon,
};

const RankBadge = ({ rank, size = 'md', showLabel = false, className = "" }) => {
    const IconComponent = RANK_COMPONENT_MAP[rank.name] || PremiumIcons.BronzeIcon;
    
    const sizeClasses = {
        sm: 'w-10 h-10 p-1',
        md: 'w-16 h-16 p-2',
        lg: 'w-24 h-24 p-3',
        xl: 'w-40 h-40 p-5'
    };

    const isHighTier = ['Heroic', 'Elite Heroic', 'Master', 'Elite Master', 'Grand Master'].includes(rank.name);
    const isElite = rank.name.includes('Elite');
    const isGrandMaster = rank.name === 'Grand Master';
    const isMasterTier = rank.name.includes('Master');
    const isEliteMaster = rank.name === 'Elite Master';
    
    return (
        <div className={`flex flex-col items-center gap-3 ${className}`}>
            <div className="relative group">
                {/* 360 Spotlight Glow */}
                <motion.div 
                    animate={{ 
                        opacity: isGrandMaster ? [0.2, 0.6, 0.2] : isMasterTier ? [0.15, 0.5, 0.15] : [0.1, 0.4, 0.1],
                        scale: isGrandMaster ? [1.2, 1.5, 1.2] : isMasterTier ? [1.1, 1.4, 1.1] : [1, 1.3, 1],
                        rotate: [0, 360]
                    }}
                    transition={{ duration: isGrandMaster ? 5 : isElite ? 7 : 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 blur-[45px] rounded-full"
                    style={{ background: `conic-gradient(from 0deg, transparent, ${rank.color}, transparent)` }}
                />

                {/* Solar Flares for GM and Elite Master */}
                {(isGrandMaster || isEliteMaster) && (
                    <motion.div 
                        animate={{ opacity: [0, 0.8, 0], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-[-20px] bg-gradient-to-t from-transparent via-current to-transparent blur-2xl rounded-full"
                        style={{ color: rank.color }}
                    />
                )}

                {/* Void Pulse for Master Ranks */}
                {isMasterTier && (
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute inset-[-10px] rounded-full blur-xl"
                        style={{ backgroundColor: rank.color }}
                    />
                )}

                {/* Main Badge Container */}
                <motion.div 
                    initial={{ perspective: 1000 }}
                    whileHover={{ scale: 1.1, rotateY: 15, rotateX: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className={`${sizeClasses[size]} rounded-[2rem] border-2 bg-gradient-to-br from-white/20 to-transparent shadow-2xl backdrop-blur-3xl flex items-center justify-center relative z-10`}
                    style={{ 
                        borderColor: isGrandMaster ? '#FFCC00' : `${rank.color}80`,
                        boxShadow: `0 0 50px ${rank.shadow}, inset 0 0 25px ${rank.shadow}`,
                        background: `radial-gradient(circle at center, ${rank.color}25, transparent)`
                    }}
                >
                    {/* Interior Glass Shine */}
                    <div className="absolute inset-1.5 bg-gradient-to-br from-white/20 via-transparent to-black/20 rounded-2xl pointer-events-none" />

                    {/* Premium Icon Component */}
                    <motion.div
                        animate={{ 
                            y: [0, -6, 0],
                            filter: [`drop-shadow(0 0 0px ${rank.color}00)`, `drop-shadow(0 0 20px ${rank.color})`, `drop-shadow(0 0 0px ${rank.color}00)`],
                            scale: isEliteMaster ? [1, 1.05, 1] : 1
                        }}
                        transition={{ duration: isMasterTier ? 2.5 : 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full h-full flex items-center justify-center relative z-20"
                    >
                        <IconComponent color={rank.color} />
                    </motion.div>

                    {/* Sub-Rank Badge Overlay */}
                    {rank.subRank && (
                        <motion.div 
                            initial={{ scale: 0, x: 10 }}
                            animate={{ scale: 1, x: 0 }}
                            className={`absolute -bottom-1 -right-1 border-2 px-3 py-0.5 rounded-full shadow-[0_5px_20px_rgba(0,0,0,0.6)] z-30 flex items-center gap-1 ${isGrandMaster ? 'bg-orange-600' : 'bg-[#1a1c23]'}`}
                            style={{ borderColor: isGrandMaster ? '#FFD700' : rank.color }}
                        >
                            <span className="text-[10px] font-black italic tracking-tighter text-white">
                                {rank.subRank}
                            </span>
                        </motion.div>
                    )}

                    {/* Kinetic Rings for High Tiers */}
                    {isHighTier && (
                        <div className="absolute inset-0 pointer-events-none overflow-visible">
                            <motion.div 
                                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                                transition={{ rotate: { duration: isElite ? 6 : 10, repeat: Infinity, ease: "linear" }, scale: { duration: 3, repeat: Infinity } }}
                                className="absolute inset-[-14px] border-2 border-white/10 rounded-full"
                                style={{ borderLeftColor: rank.color, borderRightColor: rank.color }}
                            />
                            {isElite && (
                                <motion.div 
                                    animate={{ rotate: -360, scale: [1, 1.05, 1] }}
                                    transition={{ rotate: { duration: 8, repeat: Infinity, ease: "linear" }, scale: { duration: 4, repeat: Infinity } }}
                                    className="absolute inset-[-20px] border border-white/5 rounded-full"
                                    style={{ borderTopColor: rank.color, borderBottomColor: rank.color }}
                                />
                            )}
                            {isGrandMaster && (
                                <motion.div 
                                    animate={{ rotate: -360, opacity: [0.1, 0.4, 0.1] }}
                                    transition={{ rotate: { duration: 15, repeat: Infinity, ease: "linear" }, opacity: { duration: 2, repeat: Infinity } }}
                                    className="absolute inset-[-24px] border border-dashed rounded-full"
                                    style={{ borderColor: '#FFCC00' }}
                                />
                            )}
                        </div>
                    )}
                </motion.div>
            </div>
            
            {showLabel && (
                <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-center"
                >
                    <span 
                        className="text-[11px] font-black uppercase tracking-[0.4em] italic mb-1"
                        style={{ 
                            color: 'white',
                            textShadow: `0 0 10px ${rank.shadow}`
                        }}
                    >
                        {rank.name}
                    </span>
                </motion.div>
            )}
        </div>
    );
};

export default RankBadge;
