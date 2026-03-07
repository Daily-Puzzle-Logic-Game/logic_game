import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const NumberMatrixComponent = ({ puzzleState, onUpdate, isReadOnly }) => {
    // puzzleState shape: { size: 4, grid: [4x4], initial: [4x4], solution: [4x4] }
    const { size, grid, initial } = puzzleState;

    const [selectedCell, setSelectedCell] = useState(null); // [r, c]

    // Handle keyboard inputs
    useEffect(() => {
        if (isReadOnly) return;

        const handleKeyDown = (e) => {
            if (!selectedCell) return;
            const [r, c] = selectedCell;

            // If it's a pre-filled initial cell, don't allow edits
            if (initial[r][c] !== null) return;

            const num = parseInt(e.key);
            if (num >= 1 && num <= size) {
                handleCellUpdate(r, c, num);
            } else if (e.key === 'Backspace' || e.key === 'Delete') {
                handleCellUpdate(r, c, null);
            }

            // Arrow navigation
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

        // Create deep copy of grid to update Redux/DB
        const newGrid = grid.map(row => [...row]);
        newGrid[r][c] = val;

        onUpdate({ ...puzzleState, grid: newGrid });
    };

    return (
        <div className="flex flex-col items-center gap-6">
            <div className="bg-surface p-2 rounded-xl shadow-lg border border-surface/50">
                <div
                    className="grid gap-1"
                    style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
                >
                    {grid.map((row, r) => (
                        row.map((cell, c) => {
                            const isInitial = initial[r][c] !== null;
                            const isSelected = selectedCell && selectedCell[0] === r && selectedCell[1] === c;

                            return (
                                <motion.div
                                    key={`${r}-${c}`}
                                    whileHover={!isReadOnly && !isInitial ? { scale: 0.95 } : {}}
                                    whileTap={!isReadOnly && !isInitial ? { scale: 0.90 } : {}}
                                    onClick={() => !isReadOnly && setSelectedCell([r, c])}
                                    className={`
                    w-12 h-12 md:w-16 md:h-16 flex items-center justify-center
                    text-xl md:text-2xl font-bold rounded-lg cursor-pointer transition-colors
                    ${isInitial ? 'bg-background text-text-muted cursor-not-allowed' : 'bg-surface hover:bg-surface/80'}
                    ${isSelected ? 'ring-2 ring-primary bg-primary/20 text-text-main' : 'text-text-main'}
                    ${!isInitial && cell ? 'text-secondary' : ''}
                    border border-surface
                  `}
                                >
                                    {cell || ''}
                                </motion.div>
                            );
                        })
                    ))}
                </div>
            </div>

            {/* Mobile Input Row */}
            {!isReadOnly && (
                <div className="flex gap-2 flex-wrap justify-center w-full max-w-xs md:hidden">
                    {[...Array(size).keys()].map(i => (
                        <button
                            key={i + 1}
                            onClick={() => {
                                if (selectedCell) handleCellUpdate(selectedCell[0], selectedCell[1], i + 1);
                            }}
                            className="w-12 h-12 bg-surface rounded-full font-bold active:bg-primary/50 transition-colors border border-surface"
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        onClick={() => {
                            if (selectedCell) handleCellUpdate(selectedCell[0], selectedCell[1], null);
                        }}
                        className="w-12 h-12 bg-error/20 text-error rounded-full font-bold active:bg-error/40 transition-colors"
                    >
                        X
                    </button>
                </div>
            )}
        </div>
    );
};

export default NumberMatrixComponent;
