/**
 * Validates a user's Binary Logic submission
 */
export const validateBinaryLogic = (userInputs, target, gates) => {
    const { a, b, c } = userInputs;

    if (a === null || b === null || c === null) {
        return { valid: false, message: "Please set all inputs (0 or 1)." };
    }

    const compute = (v1, v2, type) => {
        if (type === 'AND') return v1 & v2;
        if (type === 'OR') return v1 | v2;
        if (type === 'XOR') return v1 ^ v2;
        return 0;
    };

    const out1 = compute(parseInt(a), parseInt(b), gates.gate1);
    const finalOut = compute(out1, parseInt(c), gates.gate2);

    if (finalOut === target) {
        return { valid: true, message: "Circuit Solved! Signal is clear." };
    }

    return { valid: false, message: "Output mismatch. Review the gate logic." };
};
