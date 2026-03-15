import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Timer as TimerIcon, Trophy } from 'lucide-react';

const GameHUD = ({ streak, time, levelName, rank, globalSolvers }) => {
    return (
        <motion.div 
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed top-0 left-0 right-0 h-20 z-[100] px-4 md:px-8 flex items-center justify-between border-b border-white/5 bg-black/20 backdrop-blur-2xl"
        >
            {/* Left Side: Global Activity (Desktop) */}
            <div className="hidden lg:flex items-center gap-6">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-cyan/40 tracking-[0.2em]">Global_Pulse</span>
                    <div className="flex items-center gap-2 text-white font-mono text-sm font-bold">
                        <Activity size={12} className="text-cyan animate-pulse" />
                        {globalSolvers?.toLocaleString() || '4,281'}
                    </div>
                </div>
            </div>

            {/* Central Stats: The Mobile HUD */}
            <div className="flex items-center gap-3 md:gap-8 mx-auto lg:mx-0">
                {/* Streak Node */}
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 shadow-inner group">
                    <div className="flex flex-col items-center">
                        <span className="text-[7px] font-black uppercase text-white/30 tracking-widest leading-none mb-1">Streak</span>
                        <div className="flex items-center gap-1.5 font-mono text-sm font-black text-orange-500">
                            {streak}
                            <Flame size={12} className="animate-bounce" />
                        </div>
                    </div>
                </div>

                <div className="w-[1px] h-6 bg-white/10 hidden md:block" />

                {/* Timer Node */}
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex flex-col items-center">
                        <span className="text-[7px] font-black uppercase text-white/30 tracking-widest leading-none mb-1">Time</span>
                        <div className="flex items-center gap-2 font-mono text-sm font-black text-white">
                            <TimerIcon size={12} className="text-cyan" />
                            {time}
                        </div>
                    </div>
                </div>

                <div className="w-[1px] h-6 bg-white/10 hidden md:block" />

                {/* Level Node */}
                <div className="hidden md:flex flex-col items-center px-4 py-2 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                    <span className="text-[7px] font-black uppercase text-white/30 tracking-widest leading-none mb-1">Level</span>
                    <div className="text-[10px] font-black uppercase text-blue-400 tracking-tighter">
                        {levelName}
                    </div>
                </div>

                <div className="w-[1px] h-6 bg-white/10 hidden md:block" />

                {/* Rank Node */}
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-2xl border border-white/5 shadow-inner">
                    <div className="flex flex-col items-center">
                        <span className="text-[7px] font-black uppercase text-white/30 tracking-widest leading-none mb-1">Rank</span>
                        <div className="flex items-center gap-1.5 font-mono text-sm font-black text-gold">
                            <Trophy size={11} />
                            {rank}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side: Neural Link Status */}
            <div className="hidden sm:flex items-center gap-4">
                <div className="flex flex-col items-end">
                    <span className="text-[9px] font-black uppercase text-cyan/30 tracking-widest mb-0.5">Neural_Sync</span>
                    <div className="text-[11px] font-black text-cyan flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan animate-ping" />
                        STABLE_V4.8
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default GameHUD;
