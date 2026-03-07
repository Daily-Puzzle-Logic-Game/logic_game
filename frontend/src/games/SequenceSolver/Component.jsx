import { useState } from 'react';
import { motion } from 'framer-motion';

const SequenceSolverComponent = ({ puzzleState, onUpdate, isReadOnly }) => {
    // puzzleState shape: { sequence: [1, 2, null, 4], solution: 3, index: 2 }
    const { sequence, index } = puzzleState;
    const [userValue, setUserValue] = useState(sequence[index] !== null ? sequence[index] : '');

    const handleChange = (e) => {
        if (isReadOnly) return;
        const val = e.target.value;
        setUserValue(val);

        // Update the state so the validator can see it
        const newSequence = [...sequence];
        newSequence[index] = val;
        onUpdate({ ...puzzleState, sequence: newSequence });
    };

    return (
        <div className="flex flex-col items-center gap-8 py-4">
            <h3 className="text-lg font-semibold text-text-muted uppercase tracking-widest">
                Discover the hidden rule
            </h3>

            <div className="flex flex-wrap justify-center gap-3">
                {sequence.map((num, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`
                            w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl text-2xl font-bold shadow-lg border
                            ${i === index
                                ? 'bg-primary/20 border-primary ring-2 ring-primary/50'
                                : 'bg-surface border-surface/50 text-text-main'
                            }
                        `}
                    >
                        {i === index ? (
                            <input
                                type="text"
                                value={userValue}
                                onChange={handleChange}
                                disabled={isReadOnly}
                                placeholder="?"
                                className="w-full h-full bg-transparent text-center outline-none text-primary placeholder:text-primary/40"
                                autoFocus
                            />
                        ) : (
                            <span>{num}</span>
                        )}
                    </motion.div>
                ))}
            </div>

            {!isReadOnly && (
                <p className="text-text-muted text-sm max-w-xs text-center">
                    Type the missing number in the highlighted box to complete the sequence.
                </p>
            )}
        </div>
    );
};

export default SequenceSolverComponent;
