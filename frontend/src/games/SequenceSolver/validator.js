/**
 * Validates a user's Sequence Solver submission
 */
export const validateSequenceSolver = (userAnswer, solution) => {
    const val = parseInt(userAnswer);

    if (isNaN(val)) {
        return { valid: false, message: "Please enter a number." };
    }

    if (val === solution) {
        return { valid: true, message: "Correct! The logic is sound." };
    }

    return { valid: false, message: "Wrong number. Check the sequence again." };
};
