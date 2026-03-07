/**
 * Pattern Match (Visual Logic) Generator
 * 
 * Rules: 
 * A 3x3 grid displays a logical sequence of colored tiles.
 * 2 or 3 tiles are hidden. The user must deduce the pattern
 * and fill in the missing colors.
 */

// Available colors (we use simple integers 1-4 to represent distinct CSS colors)
const COLORS = [1, 2, 3, 4];

export const generatePatternMatch = (seededRandom) => {
    const size = 3;

    // Patterns to randomly choose from based on seed
    // 1: Checkerboard (alternating colors 1 and 2)
    // 2: Diagonal lines (top-left to bottom-right)
    // 3: Border vs Center
    const patternType = seededRandom.range(1, 4);

    let solution = Array.from({ length: size }, () => Array(size).fill(0));

    const c1 = COLORS[seededRandom.range(0, COLORS.length)];
    let c2 = COLORS[seededRandom.range(0, COLORS.length)];
    while (c2 === c1) c2 = COLORS[seededRandom.range(0, COLORS.length)]; // ensure different

    if (patternType === 1) { // Checkerboard
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                solution[r][c] = (r + c) % 2 === 0 ? c1 : c2;
            }
        }
    } else if (patternType === 2) { // Diagonal Lines
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (r === c) solution[r][c] = c1;
                else solution[r][c] = c2;
            }
        }
    } else { // Border vs Center
        for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
                if (r === 1 && c === 1) solution[r][c] = c1;
                else solution[r][c] = c2;
            }
        }
    }

    // Hide 3 random tiles
    const puzzle = JSON.parse(JSON.stringify(solution));
    let hiddenCount = 0;

    while (hiddenCount < 3) {
        const r = seededRandom.range(0, size);
        const c = seededRandom.range(0, size);

        if (puzzle[r][c] !== null) {
            puzzle[r][c] = null;
            hiddenCount++;
        }
    }

    return {
        solution,
        initial: puzzle,
        grid: JSON.parse(JSON.stringify(puzzle)), // Add active grid
        size
    };
};
