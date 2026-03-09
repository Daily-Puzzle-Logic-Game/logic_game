/**
 * Deduction Grid (Einstein Puzzle Variant) Generator
 * 3x3 simplified version for daily play.
 */
export const generateDeductionGrid = (seededRandom, options = {}) => {
    const difficulty = options.difficulty ?? 2;
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

    const clueCountMap = {
        1: 4,
        2: 3,
        3: 2,
        4: 2
    };
    // Harder levels provide fewer direct clues.
    const clueCount = clueCountMap[difficulty] ?? 3;

    // Pick clues according to difficulty level.
    seededRandom.shuffle(potentialClues);
    const clues = potentialClues.slice(0, clueCount);

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
