import { useState } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../../utils/SoundManager';

// Maps our generic color IDs to Tailwind background classes
const COLOR_MAP = {
    1: 'bg-indigo-500 shadow-[0_0_15px_rgba(79,70,229,0.5)] border-indigo-400',
    2: 'bg-purple-500 shadow-[0_0_15px_rgba(147,51,234,0.5)] border-purple-400',
    3: 'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)] border-cyan-400',
    4: 'bg-orange-500 shadow-[0_0_15_rgba(251,146,60,0.5)] border-orange-400',
};

const PatternMatchComponent = ({ puzzleState, onUpdate, isReadOnly }) => {
    const { size, grid, initial } = puzzleState;

    const handleCellClick = (r, c) => {
        if (isReadOnly || initial[r][c] !== null) return;
        playSound('bubble_pop');
        const newGrid = grid.map(row => [...row]);
        const currentColor = newGrid[r][c] || 0;
        newGrid[r][c] = currentColor >= 4 ? 1 : currentColor + 1;
        onUpdate({ ...puzzleState, grid: newGrid });
    };

    return (
        <div className="flex flex-col items-center gap-8">
            <div className="bg-zinc-900/60 p-4 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.6)] border border-white/5 relative overflow-hidden group">
                {/* Surface Polish */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none" />
                
                <div
                    className="grid gap-3 md:gap-4"
                    style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                >
                    {grid.map((row, r) => (
                        row.map((cell, c) => {
                            const isInitial = initial[r][c] !== null;
                            const colorClass = cell ? COLOR_MAP[cell] : 'bg-white/5 hover:bg-white/10 border-white/5';

                            return (
                                <motion.div
                                    key={`${r}-${c}`}
                                    whileHover={!isReadOnly && !isInitial ? { scale: 1.05, rotate: 2 } : {}}
                                    whileTap={!isReadOnly && !isInitial ? { scale: 0.92 } : {}}
                                    onMouseEnter={() => !isReadOnly && !isInitial && playSound('hover')}
                                    onClick={() => handleCellClick(r, c)}
                                    className={`
                                        w-16 h-16 md:w-28 md:h-28 rounded-3xl cursor-pointer transition-all duration-300 border-2
                                        ${colorClass}
                                        ${isInitial ? 'cursor-not-allowed opacity-90 border-white/20' : 'hover:shadow-2xl'}
                                        flex items-center justify-center
                                    `}
                                >
                                    {isInitial && (
                                        <div className="w-2 h-2 rounded-full bg-white/20" />
                                    )}
                                </motion.div>
                            );
                        })
                    ))}
                </div>
            </div>

            {!isReadOnly && (
                <div className="flex items-center gap-2 px-6 py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Action:</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan animate-pulse">Cycle Pattern</span>
                </div>
            )}
        </div>
    );
};

export default PatternMatchComponent;
