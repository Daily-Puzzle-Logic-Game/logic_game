import SeededRandom from '../utils/crypto';
import { generateNumberMatrix } from '../games/NumberMatrix/generator';
import { generatePatternMatch } from '../games/PatternMatch/generator';
import { generateSequenceSolver } from '../games/SequenceSolver/generator';
import { generateDeductionGrid } from '../games/DeductionGrid/generator';
import { generateBinaryLogic } from '../games/BinaryLogic/generator';

/**
 * PuzzleEngine handles deterministic puzzle generation and rotation.
 * Follows the 7-day weekly cycle:
 * Day 1 (Mon) – Number Matrix
 * Day 2 (Tue) – Pattern Recognition
 * Day 3 (Wed) – Sequence Solver
 * Day 4 (Thu) – Deduction Grid
 * Day 5 (Fri) – Binary Logic
 * Day 6 (Sat) – Hybrid (For now, random pick or mix)
 * Day 7 (Sun) – Challenge Mode (Expert difficulty)
 */
export const PUZZLE_SCHEDULE = [
    'BINARY_LOGIC',   // Sunday (Day 0) - Challenge Mode
    'NUMBER_MATRIX',  // Monday (Day 1)
    'PATTERN_MATCH',  // Tuesday (Day 2)
    'SEQUENCE_SOLVER',// Wednesday (Day 3)
    'DEDUCTION_GRID', // Thursday (Day 4)
    'BINARY_LOGIC',   // Friday (Day 5)
    'HYBRID_MODE',    // Saturday (Day 6)
];

class PuzzleEngine {
    static generateDaily(dateStr, difficulty = 'medium') {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay(); // 0 (Sun) to 6 (Sat)
        
        let puzzleType = PUZZLE_SCHEDULE[dayOfWeek];
        let forceExpert = dayOfWeek === 0; // Sunday is Challenge Mode
        
        // Handle Hybrid Mode logic
        if (puzzleType === 'HYBRID_MODE') {
             // For now, randomly pick a type but with harder constraints
             // In future, this could be a specific "Hybrid" generator
             const types = ['NUMBER_MATRIX', 'PATTERN_MATCH', 'SEQUENCE_SOLVER', 'DEDUCTION_GRID', 'BINARY_LOGIC'];
             const idx = new SeededRandom(dateStr + 'hybrid').range(0, types.length);
             puzzleType = types[idx];
        }

        const seed = `${dateStr}-${puzzleType}-${forceExpert ? 'expert' : difficulty}`;
        const rnd = new SeededRandom(seed);
        
        const options = { 
            difficulty: forceExpert ? 4 : this.difficultyToLevel(difficulty),
            isDaily: true,
            isChallenge: forceExpert
        };

        let puzzleData;
        switch (puzzleType) {
            case 'NUMBER_MATRIX': puzzleData = generateNumberMatrix(rnd, options); break;
            case 'PATTERN_MATCH': puzzleData = generatePatternMatch(rnd, options); break;
            case 'SEQUENCE_SOLVER': puzzleData = generateSequenceSolver(rnd, options); break;
            case 'DEDUCTION_GRID': puzzleData = generateDeductionGrid(rnd, options); break;
            case 'BINARY_LOGIC': puzzleData = generateBinaryLogic(rnd, options); break;
            default: puzzleData = generateNumberMatrix(rnd, options);
        }

        return {
            type: puzzleType,
            data: puzzleData,
            seed,
            isChallenge: forceExpert
        };
    }

    static difficultyToLevel(diff) {
        const map = { 'beginner': 1, 'intermediate': 2, 'medium': 2, 'advanced': 3, 'expert': 4 };
        return map[diff] || 2;
    }
}

export default PuzzleEngine;
