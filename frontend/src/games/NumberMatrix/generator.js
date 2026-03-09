/**
 * Number Matrix (Sudoku Variant) Generator
 * 
 * Rules:
 * 1. 4x4 Grid
 * 2. Each row and column must contain unique numbers 1-4.
 * 3. We use the deterministic SeededRandom to generate the solved board,
 *    and then randomly remove numbers to create the puzzle.
 */

export const generateNumberMatrix = (seededRandom, options = {}) => {
    const difficulty = options.difficulty ?? 2;
    const size = 4;

    // Step 1: Generate a valid solved 4x4 matrix (Sudoku style rows/cols unique)
    // For a 4x4, a simple valid base is:
    // 1 2 3 4
    // 3 4 1 2
    // 2 1 4 3
    // 4 3 2 1
    let solution = [
        [1, 2, 3, 4],
        [3, 4, 1, 2],
        [2, 1, 4, 3],
        [4, 3, 2, 1]
    ];

    // We can randomize this valid board by shuffling rows and cols according to our seed
    // (In a 4x4 we can shuffle row 0/1, row 2/3, col 0/1, col 2/3 and remain valid Sudoku blocks, though block validation isn't strictly required for this variant, just row/col).

    // Actually, to make it perfectly random but valid just for Row/Col uniqueness:
    // Let's just shuffle the numbers mapping. (e.g., all 1s become 3s)
    const numbers = [1, 2, 3, 4];
    seededRandom.shuffle(numbers);

    const mappedSolution = solution.map(row =>
        row.map(cell => numbers[cell - 1])
    );

    // Step 2: Create the 'puzzle' by removing cells.
    const removalMap = {
        1: 6,
        2: 8,
        3: 10,
        4: 11
    };
    // Harder levels remove more clues from the board.
    const targetRemoval = removalMap[difficulty] ?? 8;
    const puzzle = JSON.parse(JSON.stringify(mappedSolution));
    let removedCount = 0;

    while (removedCount < targetRemoval) {
        const r = seededRandom.range(0, size);
        const c = seededRandom.range(0, size);

        if (puzzle[r][c] !== null) {
            puzzle[r][c] = null;
            removedCount++;
        }
    }

    return {
        solution: mappedSolution,
        initial: puzzle,
        grid: JSON.parse(JSON.stringify(puzzle)),
        size: size
    };
};
