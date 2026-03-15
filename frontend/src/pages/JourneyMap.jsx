import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, CheckCircle2, Star, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import NeuralBackground from '../components/effects/NeuralBackground';
import { getCurrentTheme } from '../utils/ThemeManager';
import ProgressEngine from '../engines/ProgressEngine';
import RankBadge from '../components/ui/RankBadge';

// Helper to get zig-zag X offset
const getXOffset = (index) => {
    // pattern: 0, 100, 0, -100
    const offsets = [0, 120, 0, -120];
    return offsets[index % 4];
};

const JourneyNode = ({ level, isCompleted, isLocked, isCurrent, onClick, xOffset }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.5 }}
            style={{ x: xOffset }}
            className={`relative flex flex-col items-center z-20 ${isLocked ? 'opacity-40 grayscale' : ''}`}
        >
            {/* Main Node Wrapper */}
            <motion.div
                whileHover={!isLocked ? { scale: 1.1, rotate: [0, -5, 5, 0] } : {}}
                whileTap={!isLocked ? { scale: 0.95 } : {}}
                onClick={!isLocked ? onClick : undefined}
                className="relative cursor-pointer"
            >
                <div className={`w-28 h-28 rounded-[2.8rem] flex items-center justify-center relative shadow-2xl transition-all duration-500 ${
                    isCurrent ? 'bg-cyan shadow-[0_0_40px_rgba(34,211,238,0.5)] border-2 border-white' :
                    isCompleted ? 'bg-emerald-500 border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]' :
                    'bg-zinc-900 border border-white/10'
                }`}>
                    {isLocked ? <Lock size={28} className="text-white/20" /> :
                     isCompleted ? <CheckCircle2 size={36} className="text-white" /> :
                     <div className="text-3xl font-black text-white">{level}</div>}
                    
                    {isCurrent && (
                        <motion.div
                            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute inset-x-0 inset-y-0 bg-cyan rounded-[2.8rem] -z-10"
                        />
                    )}
                </div>

                {/* Stars for completed */}
                {!isLocked && isCompleted && (
                    <div className="absolute -top-4 -right-2 flex gap-1">
                        {[1, 2, 3].map(i => (
                            <Star key={i} size={14} className="text-gold fill-gold drop-shadow-[0_0_5px_rgba(255,215,0,0.8)]" />
                        ))}
                    </div>
                )}
            </motion.div>

            {/* Label */}
            <div className={`mt-4 text-[10px] font-black uppercase tracking-[0.3em] ${isCurrent ? 'text-cyan' : isCompleted ? 'text-emerald-400' : 'text-white/40'}`}>
                {isCurrent ? 'ACTIVE_TERM' : isCompleted ? `SYNCED_${level}` : `NODE_${level.toString().padStart(2, '0')}`}
            </div>
        </motion.div>
    );
};

// SVG Connection Component for the whole map
const MapPath = ({ nodes }) => {
    const spacing = 450 + 120; // gap + min-h
    // Generate path data
    const pathD = useMemo(() => {
        return nodes.reduce((acc, node, i) => {
            const x = getXOffset(i) + 500; // Offset relative to center (1000px canvas)
            const y = i * spacing + 140; 
            if (i === 0) return `M ${x} ${y}`;
            
            // Previous point
            const prevX = getXOffset(i - 1) + 500;
            const prevY = (i - 1) * spacing + 140;
            
            // Draw smooth curve to current point
            const midY = (prevY + y) / 2;
            return `${acc} C ${prevX} ${midY}, ${x} ${midY}, ${x} ${y}`;
        }, "");
    }, [nodes]);

    return (
        <svg 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] pointer-events-none z-0" 
            height={nodes.length * spacing + 500}
            viewBox={`0 0 1000 ${nodes.length * spacing + 500}`}
        >
            <defs>
                <linearGradient id="pathGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.2" />
                </linearGradient>
            </defs>
            <motion.path
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 2, ease: "easeInOut" }}
                d={pathD}
                fill="none"
                stroke="url(#pathGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray="12 12"
                className="drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]"
            />
        </svg>
    );
};

const JourneyMap = () => {
    const navigate = useNavigate();
    const [currentTheme] = useState(getCurrentTheme());
    const journeyLevel = useSelector((state) => state.game.journeyLevel || 1);
    const totalXP = useSelector((state) => state.game.totalXP || 0);
    const [viewMode, setViewMode] = useState('nodes');

    const currentLevelInfo = useMemo(() => {
        if (!ProgressEngine) return { name: 'Unknown', subRank: '' };
        return ProgressEngine.getCurrentLevelInfo(totalXP);
    }, [totalXP]);

    const nodes = useMemo(() => Array.from({ length: 100 }, (_, i) => ({
        level: i + 1,
        isCompleted: i + 1 < journeyLevel,
        isLocked: i + 1 > journeyLevel,
        isCurrent: i + 1 === journeyLevel,
        xOffset: getXOffset(i)
    })), [journeyLevel]);

    // Helper to get curated prestigious stickers based on level
    const getStickerForNode = (level) => {
        // Categories based on prestige/style
        const casualSet = [2, 4, 6, 13, 19];
        const proSet = [9, 15, 16, 18, 22];
        const eliteSet = [1, 3, 10, 11, 12, 14, 23];
        const goddessSet = [5, 7, 8, 17, 24];
        const specialSet = [20, 21];

        let set;
        if (level <= 20) set = casualSet;
        else if (level <= 50) set = proSet;
        else if (level <= 85) set = eliteSet;
        else set = goddessSet;

        // Randomly intersperse special/lore stickers (10% chance)
        const isSpecialNode = (level * 7) % 10 === 0;
        if (isSpecialNode) set = specialSet;

        // Pick a consistent sticker for this level index
        const stickerId = set[level % set.length];
        return {
            id: stickerId,
            path: `/assets/stickers/anime/girl_${stickerId}.png`
        };
    };

    const handleImgError = (e, index) => {
        // Fallback to existing assistant stickers if anime ones aren't found
        const fallbackId = (index % 5) + 1;
        e.target.src = `/assets/stickers/journey_pose_${fallbackId}.png`;
    };

    return (
        <div className="min-h-screen w-full bg-[#08080a] relative overflow-hidden flex flex-col items-center py-32">
            <NeuralBackground theme={currentTheme} />

            {/* Header HUD - Absolute position so it scrolls away with content */}
            <div className="absolute top-24 left-0 right-0 z-[60] p-4 flex justify-center pointer-events-none">
                <div className="w-full max-w-6xl flex flex-col md:flex-row justify-between items-center md:items-start pointer-events-auto gap-6 px-4">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/5 py-3.5 px-8 rounded-2xl shadow-2xl min-w-[320px]">
                        <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                            NEURAL_<span className="text-cyan">PROSECUTION</span>
                        </h1>
                        <p className="text-[8px] font-bold text-cyan/40 uppercase tracking-[0.5em] mt-1.5 ">SECTOR_100 // SYSTEM_OVERHAUL</p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-3">
                        <div className="flex bg-black/80 backdrop-blur-3xl border border-white/10 p-1.5 rounded-2xl shadow-2xl min-w-[220px] justify-center">
                            {['nodes', 'medals'].map(mode => (
                                <button 
                                    key={mode}
                                    onClick={() => setViewMode(mode)}
                                    className={`flex-1 px-8 py-2 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] transition-all ${viewMode === mode ? 'bg-cyan text-black shadow-[0_0_20px_rgba(34,211,238,0.5)]' : 'text-white/30 hover:text-white'}`}
                                >
                                    {mode}
                                </button>
                            ))}
                        </div>
                        
                        <div className="bg-black/60 backdrop-blur-3xl border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-5 shadow-2xl min-w-[240px] justify-end">
                            <RankBadge rank={currentLevelInfo} size="sm" />
                            <div className="text-right min-w-[80px]">
                                <span className="block text-[8px] font-black text-white/20 uppercase tracking-widest mb-0.5">Lvl_{currentLevelInfo.level}</span>
                                <span className="text-base font-black text-white tracking-tight whitespace-nowrap">
                                    {currentLevelInfo.name} <span className="text-cyan">{currentLevelInfo.subRank}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="relative z-10 w-full max-w-7xl pt-48 pb-64">
                <AnimatePresence mode="wait">
                    {viewMode === 'nodes' ? (
                        <motion.div key="nodes" className="relative flex flex-col items-center">
                            {/* SVG Connection Path */}
                            <MapPath nodes={nodes} />

                            {/* Node Path - Increased gap to 450px to prevent sticker overlap */}
                            <div className="flex flex-col gap-[450px]">
                                {nodes.map((node, index) => (
                                    <div key={node.level} className="relative flex justify-center min-h-[120px]">
                                        <JourneyNode 
                                            {...node} 
                                            onClick={() => navigate(`/play/journey/${node.level}`)}
                                        />

                                        {/* Anime Companion - Curated Prestigious Stickers */}
                                        {(() => {
                                            const sticker = getStickerForNode(node.level);
                                            return (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    whileInView={{ opacity: 1, scale: 1 }}
                                                    viewport={{ once: true, amount: 0.2 }}
                                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                                    className={`absolute top-1/2 -translate-y-1/2 hidden lg:block w-[320px] pointer-events-none
                                                        ${getXOffset(index) > 0 ? '-left-[380px] text-right' : '-right-[380px] text-left'}`}
                                                >
                                                    <div className="relative group/sticker">
                                                        <div className="absolute inset-x-0 inset-y-10 bg-cyan/5 blur-[80px] rounded-full opacity-50 group-hover/sticker:opacity-100 transition-opacity" />
                                                        <img 
                                                            src={sticker.path}
                                                            alt="Neural Guardian"
                                                            onError={(e) => handleImgError(e, index)}
                                                            loading="lazy"
                                                            className="w-full h-auto opacity-75 group-hover/sticker:opacity-100 transition-all duration-1000 drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)] floating-sticker"
                                                            style={{ 
                                                                animationDelay: `${index * 0.4}s`,
                                                                maskImage: 'linear-gradient(to bottom, black 80%, transparent)' 
                                                            }}
                                                        />
                                                        <div className="mt-4 font-mono text-[7px] text-white/5 uppercase tracking-[0.5em] italic">
                                                            GUARDIAN_UNIT_{sticker.id.toString().padStart(2, '0')}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            );
                                        })()}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="medals"
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 px-8"
                        >
                            {(ProgressEngine?.LEVEL_TIERS || []).map((tier, idx) => {
                                const isUnlocked = totalXP >= tier.baseXP;
                                const isCurrent = currentLevelInfo.name === tier.name;
                                
                                return (
                                    <motion.div 
                                        key={tier.name}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className={`p-8 rounded-[3rem] border backdrop-blur-3xl flex flex-col items-center gap-6 group relative overflow-hidden transition-all duration-500
                                            ${isUnlocked ? 'border-cyan/20 bg-cyan/5 shadow-[0_0_30px_rgba(34,211,238,0.05)]' : 'border-white/5 bg-white/[0.02] opacity-40'}`}
                                    >
                                        <RankBadge rank={isCurrent ? currentLevelInfo : tier} size="lg" />
                                        <div className="text-center relative z-10">
                                            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] mb-2 ${isCurrent ? 'text-cyan' : 'text-white'}`}>{tier.name}</h3>
                                            <p className="text-[8px] font-mono text-white/30 truncate">LVL_{tier.range[0]} — LVL_{tier.range[1]}</p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Float HUD - Resume */}
            <div className="fixed bottom-12 left-0 right-0 z-40 flex justify-center pointer-events-none">
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onClick={() => navigate(`/play/journey/${journeyLevel}`)}
                    className="pointer-events-auto bg-cyan hover:bg-white text-black px-16 py-5 rounded-3xl font-black text-xs tracking-[0.3em] uppercase flex items-center gap-4 transition-all hover:scale-105 active:scale-95 shadow-[0_20px_50px_rgba(34,211,238,0.3)] group"
                >
                    <Play size={18} className="fill-current group-hover:scale-110 transition-transform" />
                    RESUME_SYNC
                </motion.button>
            </div>
        </div>
    );
};

export default JourneyMap;
