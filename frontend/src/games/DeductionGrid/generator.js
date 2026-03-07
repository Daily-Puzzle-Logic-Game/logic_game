/**
 * Deduction Grid (Einstein Puzzle Variant) Generator
 * 3x3 simplified version for daily play.
 */
export const generateDeductionGrid = (seededRandom) => {
    // Categories
    const people = ['Alex', 'Blake', 'Casey'];
    const colors = ['Red', 'Green', 'Blue'];
    const items = ['Laptop', 'Book', 'Phone'];

    // 1. Generate an internal random but valid solution mapping
    // Person -> Color, Person -> Item
    const colorOrder = [...colors];
    const itemOrder = [...items];
    seededRandom.shuffle(colorOrder);
    seededRandom.shuffle(itemOrder);

    const solution = {
        'Alex': { color: colorOrder[0], item: itemOrder[0] },
        'Blake': { color: colorOrder[1], item: itemOrder[1] },
        'Casey': { color: colorOrder[2], item: itemOrder[2] },
    };

    /**
     * Clue types:
     * - "X has the Y" (Direct)
     * - "The person with the X doesn't have Y" (Negative)
     * - "The person with X has Y" (Cross-category)
     */
    const potentialClues = [
        `Alex has the ${solution['Alex'].item}.`,
        `Blake lives in the ${solution['Blake'].color} house.`,
        `Casey doesn't have the ${items.find(i => i !== solution['Casey'].item)}.`,
        `The person in the ${solution['Blake'].color} house has the ${solution['Blake'].item}.`,
        `${solution['Alex'].color === 'Red' ? 'Alex' : 'The person in the Red house'} doesn't have the ${items.find(i => i !== solution[Object.keys(solution).find(k => solution[k].color === 'Red')].item)}.`,
    ];

    // Pick 3 interesting clues
    seededRandom.shuffle(potentialClues);
    const clues = potentialClues.slice(0, 3);

    const initial = {
        Alex: { color: null, item: null },
        Blake: { color: null, item: null },
        Casey: { color: null, item: null }
    };

    return {
        people,
        colors,
        items,
        clues,
        solution,
        gridState: JSON.parse(JSON.stringify(initial)),
        initial: initial
    };
};
