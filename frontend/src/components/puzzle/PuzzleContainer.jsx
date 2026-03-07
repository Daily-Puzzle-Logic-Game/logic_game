import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { db } from '../../db/db';
import { getTodayDateString } from '../../utils/time';
import { PUZZLE_TYPES, PUZZLE_COMPONENTS } from '../../config/puzzleTypes';
import SeededRandom from '../../utils/crypto';

// Generators
import { generateNumberMatrix } from '../../games/NumberMatrix/generator';
import { generatePatternMatch } from '../../games/PatternMatch/generator';
import { generateSequenceSolver } from '../../games/SequenceSolver/generator';
import { generateDeductionGrid } from '../../games/DeductionGrid/generator';
import { generateBinaryLogic } from '../../games/BinaryLogic/generator';

// Validators
import { validateNumberMatrix } from '../../games/NumberMatrix/validator';
import { validatePatternMatch } from '../../games/PatternMatch/validator';
import { validateSequenceSolver } from '../../games/SequenceSolver/validator';
import { validateDeductionGrid } from '../../games/DeductionGrid/validator';
import { validateBinaryLogic } from '../../games/BinaryLogic/validator';

/**
 * The Master Engine Wrapper
 * Handles loading, saving, and validating any puzzle type.
 */
const PuzzleContainer = ({ user, todayProgress, practiceMode = false, practiceType = null }) => {
    const [activeState, setActiveState] = useState(null);
    const [statusMsg, setStatusMsg] = useState(null); // { type: 'error' | 'success', text: string }
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate state
    useEffect(() => {
        const initPractice = async () => {
            setIsLoading(true);
            const rnd = new SeededRandom(Date.now().toString());
            const type = practiceType || PUZZLE_TYPES.NUMBER_MATRIX;

            let puzzleData;
            switch (type) {
                case PUZZLE_TYPES.NUMBER_MATRIX: puzzleData = generateNumberMatrix(rnd); break;
                case PUZZLE_TYPES.PATTERN_MATCH: puzzleData = generatePatternMatch(rnd); break;
                case PUZZLE_TYPES.SEQUENCE_SOLVER: puzzleData = generateSequenceSolver(rnd); break;
                case PUZZLE_TYPES.DEDUCTION_GRID: puzzleData = generateDeductionGrid(rnd); break;
                case PUZZLE_TYPES.BINARY_LOGIC: puzzleData = generateBinaryLogic(rnd); break;
                default: puzzleData = generateNumberMatrix(rnd);
            }

            setActiveState(puzzleData);
            setIsLoading(false);
        };

        if (practiceMode) {
            initPractice();
        } else if (todayProgress) {
            setActiveState(todayProgress.state);
            setIsLoading(false);
        }
    }, [todayProgress, practiceMode, practiceType]);

    // Handle updates coming up from children
    const handleValueUpdate = async (newState) => {
        if (!practiceMode && todayProgress?.completed) return;

        setActiveState(newState);

        if (!practiceMode) {
            const todayStr = getTodayDateString();
            // Save to local IndexedDB instantly
            await db.dailyProgress.update(todayStr, { state: newState });
        }

        setStatusMsg(null);
    };

    const handleValidation = async () => {
        if (!activeState || (!practiceMode && !todayProgress)) return;

        let result;
        const type = practiceMode ? practiceType : todayProgress.puzzleType;

        switch (type) {
            case PUZZLE_TYPES.NUMBER_MATRIX:
                result = validateNumberMatrix(activeState.grid, activeState.solution);
                break;
            case PUZZLE_TYPES.PATTERN_MATCH:
                result = validatePatternMatch(activeState.grid, activeState.solution);
                break;
            case PUZZLE_TYPES.SEQUENCE_SOLVER:
                result = validateSequenceSolver(activeState.sequence[activeState.index], activeState.solution);
                break;
            case PUZZLE_TYPES.DEDUCTION_GRID:
                result = validateDeductionGrid(activeState.gridState, activeState.solution);
                break;
            case PUZZLE_TYPES.BINARY_LOGIC:
                result = validateBinaryLogic(activeState.inputs, activeState.target, activeState.gates);
                break;
            default:
                result = { valid: false, message: "Unknown puzzle type." };
        }

        if (result.valid) {
            setStatusMsg({ type: 'success', text: result.message });

            if (!practiceMode) {
                const todayStr = getTodayDateString();
                await db.dailyProgress.update(todayStr, { completed: true });

                // Update User Streak
                const prevStreak = user.streakCount || 0;
                await db.user.update('local_user', {
                    streakCount: prevStreak + 1,
                    lastPlayed: todayStr
                });
            }

        } else {
            setStatusMsg({ type: 'error', text: result.message });
        }
    };

    if (isLoading || !activeState) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-primary">
                <Loader2 className="animate-spin w-8 h-8 mb-4" />
                <p className="font-mono text-text-muted">Loading Daily Logic...</p>
            </div>
        );
    }

    const puzzleTypeKey = practiceMode ? practiceType : todayProgress?.puzzleType;
    const ActiveComponent = PUZZLE_COMPONENTS[puzzleTypeKey];

    if (!ActiveComponent) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-error">
                <AlertCircle className="w-8 h-8 mb-4" />
                <p className="font-mono text-sm">Error: Game Type "{puzzleTypeKey}" not found.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto p-4 md:p-8 bg-surface/50 rounded-2xl shadow-xl mt-8">

            <div className="w-full flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold tracking-wider text-text-main flex items-center gap-2">
                    {(practiceMode ? practiceType : todayProgress?.puzzleType)?.replace('_', ' ')}
                    {practiceMode && <span className="text-[10px] bg-accent/20 text-accent px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Practice</span>}
                </h2>
                <div className="flex flex-col items-end">
                    <span className="bg-background px-3 py-1 rounded text-[10px] text-text-muted font-mono border border-surface shadow-inner">
                        Hints: {user?.hintsRemaining || 0}
                    </span>
                </div>
            </div>

            {/* Dynamic Rules Box */}
            <div className="w-full bg-brand-200/5 border border-brand-300/20 p-4 rounded-lg mb-6 text-sm text-text-muted shadow-inner">
                <span className="font-bold text-accent mb-1 block uppercase text-[10px] tracking-widest">Rules</span>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                    {(practiceMode ? practiceType : todayProgress?.puzzleType) === PUZZLE_TYPES.NUMBER_MATRIX && (
                        <>
                            <li>Fill the empty cells so every row/col has unique numbers 1-4.</li>
                            <li>Click a cell, then use your keyboard or the buttons below.</li>
                        </>
                    )}
                    {(practiceMode ? practiceType : todayProgress?.puzzleType) === PUZZLE_TYPES.PATTERN_MATCH && (
                        <>
                            <li>Complete the visual logic and symmetry.</li>
                            <li>Click tiles to cycle through colors until the pattern is perfect.</li>
                        </>
                    )}
                    {(practiceMode ? practiceType : todayProgress?.puzzleType) === PUZZLE_TYPES.SEQUENCE_SOLVER && (
                        <>
                            <li>Identify the mathematical rule connecting the numbers.</li>
                            <li>Type the missing value to complete the sequence.</li>
                        </>
                    )}
                    {(practiceMode ? practiceType : todayProgress?.puzzleType) === PUZZLE_TYPES.DEDUCTION_GRID && (
                        <>
                            <li>Use the logical clues to map attributes to each person.</li>
                            <li>Select the correct options for every row.</li>
                        </>
                    )}
                    {(practiceMode ? practiceType : todayProgress?.puzzleType) === PUZZLE_TYPES.BINARY_LOGIC && (
                        <>
                            <li>Toggle the unknown bits (0 or 1) in the logic circuit.</li>
                            <li>The final output must match the target value.</li>
                        </>
                    )}
                </ul>
            </div>

            <div className="mb-8 w-full min-h-[200px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={practiceMode ? practiceType : todayProgress?.puzzleType}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full"
                    >
                        <ActiveComponent
                            puzzleState={activeState}
                            onUpdate={handleValueUpdate}
                            isReadOnly={!practiceMode && todayProgress?.completed}
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            <div className="w-full h-12 flex items-center justify-center">
                <AnimatePresence mode="wait">
                    {statusMsg && (
                        <motion.div
                            key={statusMsg.text}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-md
                                ${statusMsg.type === 'error' ? 'bg-error/20 text-error' : 'bg-accent/20 text-accent'}
                            `}
                        >
                            {statusMsg.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
                            {statusMsg.text}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="w-full flex justify-between mt-4">
                <button
                    className="px-4 py-2 text-text-muted hover:text-text-main transition-colors text-sm font-semibold rounded"
                    disabled={!practiceMode && todayProgress?.completed}
                    onClick={() => {
                        if (practiceMode) {
                            // In practice mode, reset just generates a new one
                            window.location.reload();
                        }
                    }}
                >
                    {practiceMode ? 'New Game' : 'Reset'}
                </button>
                <button
                    onClick={handleValidation}
                    disabled={!practiceMode && todayProgress?.completed}
                    className={`px-8 py-3 rounded-lg font-bold text-white shadow-lg transition-transform
                        ${(!practiceMode && todayProgress?.completed) ? 'bg-surface text-text-muted opacity-50 cursor-not-allowed' : 'bg-primary hover:scale-105 active:scale-95'}
                    `}
                >
                    {!practiceMode && todayProgress?.completed ? 'SOLVED' : 'SUBMIT'}
                </button>
            </div>
        </div>
    );
};

export default PuzzleContainer;
