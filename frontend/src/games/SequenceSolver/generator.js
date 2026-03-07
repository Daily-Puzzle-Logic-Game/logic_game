/**
 * Sequence Solver (Math / Logical Sequences) Generator
 */
export const generateSequenceSolver = (seededRandom) => {
    // 1. Choose a sequence type
    const sequenceType = seededRandom.range(1, 5);
    let sequence = [];
    let hiddenIndex = seededRandom.range(2, 5); // Hide an middle/late element
    let rule = '';

    const start = seededRandom.range(1, 11);

    if (sequenceType === 1) { // Arithmetic (+n)
        const diff = seededRandom.range(2, 6);
        for (let i = 0; i < 6; i++) {
            sequence.push(start + (i * diff));
        }
        rule = `Add ${diff}`;
    } else if (sequenceType === 2) { // Geometric (*n)
        const ratio = seededRandom.range(2, 4);
        const gStart = seededRandom.range(1, 6);
        for (let i = 0; i < 6; i++) {
            sequence.push(gStart * Math.pow(ratio, i));
        }
        rule = `Multiply by ${ratio}`;
    } else if (sequenceType === 3) { // Squares (n^2)
        const offset = seededRandom.range(1, 6);
        for (let i = 0; i < 6; i++) {
            sequence.push(Math.pow(i + offset, 2));
        }
        rule = "Perfect Squares";
    } else { // Fibonacci-style (a + b)
        let a = seededRandom.range(1, 6);
        let b = seededRandom.range(1, 6);
        sequence.push(a);
        sequence.push(b);
        for (let i = 2; i < 6; i++) {
            let next = sequence[i - 1] + sequence[i - 2];
            sequence.push(next);
        }
        rule = "Sum of previous two";
    }

    const solution = sequence[hiddenIndex];
    const puzzle = [...sequence];
    puzzle[hiddenIndex] = null;

    return {
        sequence: puzzle,
        initial: puzzle,
        solution: solution,
        index: hiddenIndex,
        rule: rule
    };
};
