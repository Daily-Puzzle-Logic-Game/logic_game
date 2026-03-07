/**
 * Validates a user's Pattern Match submission
 */
export const validatePatternMatch = (grid, solution) => {
    const size = grid.length;

    // 1. Check for complete fill
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (!grid[r][c]) {
                return { valid: false, message: "Grid incomplete." };
            }
        }
    }

    // 2. Exact match check
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (grid[r][c] !== solution[r][c]) {
                return { valid: false, message: "Pattern does not match the rule." };
            }
        }
    }

    return { valid: true, message: "Pattern complete! Excellent visualization." };
};
