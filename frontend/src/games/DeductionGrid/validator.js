/**
 * Validates a user's Deduction Grid submission
 */
export const validateDeductionGrid = (gridState, solution) => {
    const people = Object.keys(gridState);

    for (const person of people) {
        if (!gridState[person].color || !gridState[person].item) {
            return { valid: false, message: "Please complete all assignments." };
        }

        if (gridState[person].color !== solution[person].color ||
            gridState[person].item !== solution[person].item) {
            return { valid: false, message: "Incorrect deductions. Check the clues again." };
        }
    }

    return { valid: true, message: "Perfect deduction! You're a logic master." };
};
