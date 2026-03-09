/**
 * Binary Logic (Gate-based puzzles) Generator
 */
export const generateBinaryLogic = (seededRandom, options = {}) => {
    const difficulty = options.difficulty ?? 2;
    const gates = ['AND', 'OR', 'XOR'];

    // Choose two gates for a 3-input circuit: (A gate1 B) gate2 C
    const gate1 = gates[seededRandom.range(0, gates.length)];
    const gate2 = gates[seededRandom.range(0, gates.length)];

    // Random inputs
    const a = seededRandom.range(0, 2);
    const b = seededRandom.range(0, 2);
    const c = seededRandom.range(0, 2);

    // Compute intermediate Output 1
    const compute = (v1, v2, type) => {
        if (type === 'AND') return v1 & v2;
        if (type === 'OR') return v1 | v2;
        if (type === 'XOR') return v1 ^ v2;
        return 0;
    };

    const out1 = compute(a, b, gate1);
    const finalOut = compute(out1, c, gate2);

    // Hide one or two inputs
    const puzzle = { a, b, c };
    const hiddenSlots = difficulty >= 3 ? 2 : 1;
    const hidden = seededRandom.shuffle(['a', 'b', 'c']).slice(0, hiddenSlots);

    hidden.forEach(key => puzzle[key] = null);

    return {
        inputs: JSON.parse(JSON.stringify(puzzle)),
        initial: puzzle,
        gates: { gate1, gate2 },
        target: finalOut,
        solution: { a, b, c }
    };
};
