import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../../utils/SoundManager';

const NumberMatrixComponent = ({ puzzleState, onUpdate, isReadOnly }) => {
    const { size, grid, initial } = puzzleState;
    const [selectedCell, setSelectedCell] = useState(null);

    useEffect(() => {
        if (isReadOnly) return;
        const handleKeyDown = (e) => {
            if (!selectedCell) return;
            const [r, c] = selectedCell;
            if (initial[r][c] !== null) return;

            const num = parseInt(e.key);
            if (num >= 1 && num <= size) {
                handleCellUpdate(r, c, num);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                handleCellUpdate(r, c, null);
            }

            if (e.key === 'ArrowUp') setSelectedCell([Math.max(0, r - 1), c]);
            if (e.key === 'ArrowDown') setSelectedCell([Math.min(size - 1, r + 1), c]);
            if (e.key === 'ArrowLeft') setSelectedCell([r, Math.max(0, c - 1)]);
            if (e.key === 'ArrowRight') setSelectedCell([r, Math.min(size - 1, c + 1)]);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCell, isReadOnly, initial, size]);

    const handleCellUpdate = (r, c, val) => {
        if (isReadOnly || initial[r][c] !== null) return;
        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = val;
        onUpdate({ ...puzzleState, grid: newGrid });
    };

    return (
        <div className="flex flex-col items-center gap-8">
            <div className="bg-zinc-900/60 p-4 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5 relative overflow-hidden group">
                {/* Board Shine */}
                <div className="absolute -inset-x-20 top-0 h-40 bg-gradient-to-b from-white/5 to-transparent -skew-y-12 pointer-events-none" />
                
                <div
                    className="grid gap-2 md:gap-3"
                    style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                >
                    {grid.map((row, r) => (
                        row.map((cell, c) => {
                            const isInitial = initial[r][c] !== null;
                            const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;

                            return (
                                <motion.div
                                    key={`${r}-${c}`}
                                    whileHover={!isReadOnly && !isInitial ? { scale: 1.05, y: -2 } : {}}
                                    whileTap={!isReadOnly && !isInitial ? { scale: 0.92 } : {}}
                                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    onMouseEnter={() => !isReadOnly && !isInitial && playSound('hover')}
                                    onClick={() => {
                                        if (isReadOnly) return;
                                        setSelectedCell([r, c]);
                                        playSound('bubble_pop');
                                    }}
                                    className={`
                                        w-14 h-14 md:w-20 md:h-20 flex items-center justify-center
                                        text-2xl md:text-3xl font-black rounded-2xl cursor-pointer transition-all duration-300
                                        ${isInitial 
                                            ? 'bg-zinc-950/40 text-white/20 border border-white/5 cursor-not-allowed shadow-inner' 
                                            : 'bg-white/5 hover:bg-white/10 border border-white/10 shadow-lg'
                                        }
                                        ${isSelected 
                                            ? 'ring-4 ring-cyan/50 bg-cyan/10 text-cyan scale-105 shadow-[0_0_20px_rgba(34,211,238,0.4)] z-10 border-cyan' 
                                            : 'text-white'
                                        }
                                        ${!isInitial && cell ? 'text-cyan-400 text-shadow-glow' : ''}
                                    `}
                                >
                                    <span className={isSelected ? 'animate-bounce-soft' : ''}>
                                        {cell || ''}
                                    </span>
                                </motion.div>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Gaming Input Terminal */}
            {!isReadOnly && (
                <div className="flex flex-wrap justify-center gap-3 p-4 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-md">
                    {[...Array(size).keys()].map(i => (
                        <motion.button
                            key={i + 1}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onMouseEnter={() => playSound('hover')}
                                onClick={() => {
                                    if (selectedCell) {
                                        handleCellUpdate(selectedCell[0], selectedCell[1], i + 1);
                                        playSound('crystal_ding');
                                    }
                                }}
                            className="w-12 h-12 md:w-14 md:h-14 bg-zinc-800 hover:bg-primary text-white rounded-xl font-black text-xl transition-colors border border-white/10 shadow-xl"
                        >
                            {i + 1}
                        </motion.button>
                    ))}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onMouseEnter={() => playSound('hover')}
                        onClick={() => {
                                if (selectedCell) {
                                    handleCellUpdate(selectedCell[0], selectedCell[1], null);
                                    playSound('oops_thud');
                                }
                        }}
                        className="w-12 h-12 md:w-14 md:h-14 bg-error/20 hover:bg-error/40 text-error rounded-xl font-black transition-colors border border-error/30"
                    >
                        DEL
                    </motion.button>
                </div>
            )}
        </div>
    );
};

export default NumberMatrixComponent;
