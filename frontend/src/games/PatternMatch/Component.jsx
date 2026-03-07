import { useState } from 'react';
import { motion } from 'framer-motion';

// Maps our generic color IDs to Tailwind background classes
const COLOR_MAP = {
    1: 'bg-primary',
    2: 'bg-secondary',
    3: 'bg-accent',
    4: 'bg-error',
};

const PatternMatchComponent = ({ puzzleState, onUpdate, isReadOnly }) => {
    const { size, grid, initial } = puzzleState;

    // Cycles through the 4 colors when clicked
    const handleCellClick = (r, c) => {
        if (isReadOnly || initial[r][c] !== null) return;

        const newGrid = grid.map(row => [...row]);
        const currentColor = newGrid[r][c] || 0;

        // Cycle 0 -> 1 -> 2 -> 3 -> 4 -> 1...
        newGrid[r][c] = currentColor >= 4 ? 1 : currentColor + 1;

        onUpdate({ ...puzzleState, grid: newGrid });
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="bg-surface p-3 rounded-xl shadow-lg border border-surface/50">
                <div
                    className="grid gap-2"
                    style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                >
                    {grid.map((row, r) => (
                        row.map((cell, c) => {
                            const isInitial = initial[r][c] !== null;

                            // Base styling depending on if it's filled or empty
                            const colorClass = cell ? COLOR_MAP[cell] : 'bg-background hover:bg-surface/80';

                            return (
                                <motion.div
                                    key={`${r}-${c}`}
                                    whileHover={!isReadOnly && !isInitial ? { scale: 0.95 } : {}}
                                    whileTap={!isReadOnly && !isInitial ? { scale: 0.90 } : {}}
                                    onClick={() => handleCellClick(r, c)}
                                    className={`
                    w-16 h-16 md:w-24 md:h-24 rounded-lg cursor-pointer transition-colors shadow-inner border border-surface/50
                    ${colorClass}
                    ${isInitial ? 'cursor-not-allowed opacity-90' : 'ring-2 ring-transparent focus:ring-primary'}
                  `}
                                />
                            );
                        })
                    ))}
                </div>
            </div>

            {!isReadOnly && (
                <p className="text-sm text-text-muted mt-4">
                    Click the empty tiles to cycle through colors until the pattern matches.
                </p>
            )}
        </div>
    );
};

export default PatternMatchComponent;
