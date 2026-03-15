import NumberMatrixComponent from '../games/NumberMatrix/Component';
import PatternMatchComponent from '../games/PatternMatch/Component';
import SequenceSolverComponent from '../games/SequenceSolver/Component';
import DeductionGridComponent from '../games/DeductionGrid/Component';
import BinaryLogicComponent from '../games/BinaryLogic/Component';

export const PUZZLE_TYPES = {
    NUMBER_MATRIX: 'NUMBER_MATRIX',
    PATTERN_MATCH: 'PATTERN_MATCH',
    SEQUENCE_SOLVER: 'SEQUENCE_SOLVER',
    DEDUCTION_GRID: 'DEDUCTION_GRID',
    BINARY_LOGIC: 'BINARY_LOGIC',
};

// Puzzle Unlock Thresholds
export const UNLOCK_REQUIREMENTS = {
    [PUZZLE_TYPES.NUMBER_MATRIX]: 0,
    [PUZZLE_TYPES.PATTERN_MATCH]: 5,
    [PUZZLE_TYPES.SEQUENCE_SOLVER]: 10,
    [PUZZLE_TYPES.DEDUCTION_GRID]: 20,
    [PUZZLE_TYPES.BINARY_LOGIC]: 30, // Progression extension
};

// Map the puzzle type string to its corresponding React component
export const PUZZLE_COMPONENTS = {
    [PUZZLE_TYPES.NUMBER_MATRIX]: NumberMatrixComponent,
    [PUZZLE_TYPES.PATTERN_MATCH]: PatternMatchComponent,
    [PUZZLE_TYPES.SEQUENCE_SOLVER]: SequenceSolverComponent,
    [PUZZLE_TYPES.DEDUCTION_GRID]: DeductionGridComponent,
    [PUZZLE_TYPES.BINARY_LOGIC]: BinaryLogicComponent,
};
