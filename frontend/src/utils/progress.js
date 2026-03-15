import { PUZZLE_TYPES } from '../config/puzzleTypes';

/**
 * calculateProgress - Estimates the completion percentage of a puzzle.
 */
export const calculateProgress = (type, state) => {
    if (!state) return 0;

    switch (type) {
        case PUZZLE_TYPES.NUMBER_MATRIX: {
            const grid = state.grid;
            const size = grid.length * grid[0].length;
            const filled = grid.flat().filter(v => v !== null && v !== undefined && v !== '').length;
            return (filled / size) * 100;
        }

        case PUZZLE_TYPES.PATTERN_MATCH: {
            const grid = state.grid;
            const solution = state.solution;
            const total = grid.length * grid[0].length;
            let correct = 0;
            for (let r = 0; r < grid.length; r++) {
                for (let c = 0; c < grid[0].length; c++) {
                    if (grid[r][c] === solution[r][c]) correct++;
                }
            }
            return (correct / total) * 100;
        }

        case PUZZLE_TYPES.SEQUENCE_SOLVER: {
            // Sequence is binary: solved or not. 
            // But we can check if anything is typed.
            return state.ans ? 100 : 0;
        }

        case PUZZLE_TYPES.DEDUCTION_GRID: {
            const gridState = state.gridState;
            const total = Object.keys(gridState).length;
            const filled = Object.values(gridState).filter(v => v !== null && v !== '').length;
            return (filled / total) * 100;
        }

        case PUZZLE_TYPES.BINARY_LOGIC: {
            const inputs = state.inputs;
            const total = Object.keys(inputs).length;
            // For binary logic, progress is hard to measure by "fill" since they are all 0/1.
            // We can measure by "closeness" to target if we really wanted to, 
            // but for now let's just use "interaction count" vs "entropy" or 100 if solved.
            return state.solved ? 100 : (Object.values(inputs).length > 0 ? 50 : 0);
        }

        default:
            return 0;
    }
};
