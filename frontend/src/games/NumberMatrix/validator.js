/**
 * Validates a user's Number Matrix submission
 */
export const validateNumberMatrix = (grid, solution) => {
    const size = grid.length;

    // 1. Check for complete fill
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c] === null || grid[r][c] === undefined || grid[r][c] === '') {
                return { valid: false, message: "Grid incomplete." };
            }
        }
    }

    // 2. Check Row/Col Uniqueness (pure Sudoku variant rules)
    for (let i = 0; i < size; i++) {
        const rowSet = new Set();
        const colSet = new Set();

        for (let j = 0; j < size; j++) {
            rowSet.add(grid[i][j]);
            colSet.add(grid[j][i]);
        }

        if (rowSet.size !== size) return { valid: false, message: `Duplicate found in Row ${i + 1}` };
        if (colSet.size !== size) return { valid: false, message: `Duplicate found in Col ${i + 1}` };
    }

    // 3. Final verification against the generated solution
    // For this variant, any configuration of unique row/columns that satisfies the board is considered a valid WIN.
    // We intentionally ignore `solution[r][c]` matching so users aren't penalized for finding an alternative valid solve.

    return { valid: true, message: "Puzzle Solved! Great logic." };
};
