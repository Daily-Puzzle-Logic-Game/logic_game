import { useState } from 'react';
import { motion } from 'framer-motion';

const DeductionGridComponent = ({ puzzleState, onUpdate, isReadOnly }) => {
    const { people, colors, items, clues, gridState } = puzzleState;

    const [localState, setLocalState] = useState(gridState);

    const handleSelect = (person, type, value) => {
        if (isReadOnly) return;
        const newState = {
            ...localState,
            [person]: { ...localState[person], [type]: value }
        };
        setLocalState(newState);
        onUpdate({ ...puzzleState, gridState: newState });
    };

    return (
        <div className="flex flex-col gap-6 py-2 w-full max-w-2xl mx-auto">
            {/* Clues Card */}
            <div className="bg-surface/50 border border-surface p-4 rounded-xl shadow-inner">
                <h4 className="text-xs font-bold text-primary uppercase tracking-tighter mb-3">Logic Clues</h4>
                <ul className="space-y-2">
                    {clues.map((clue, i) => (
                        <li key={i} className="text-sm text-text-main flex gap-2">
                            <span className="text-primary font-bold">•</span>
                            {clue}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Selection Grid */}
            <div className="space-y-4">
                {people.map((person) => (
                    <motion.div
                        key={person}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-surface p-4 rounded-2xl border border-surface shadow-md"
                    >
                        <div className="font-bold text-lg text-text-main">{person}</div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-text-muted">House Color</label>
                            <select
                                value={localState[person].color || ''}
                                onChange={(e) => handleSelect(person, 'color', e.target.value)}
                                disabled={isReadOnly}
                                className="bg-background border border-surface rounded-lg p-2 text-sm text-text-main outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Select Color</option>
                                {colors.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-text-muted">Possession</label>
                            <select
                                value={localState[person].item || ''}
                                onChange={(e) => handleSelect(person, 'item', e.target.value)}
                                disabled={isReadOnly}
                                className="bg-background border border-surface rounded-lg p-2 text-sm text-text-main outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value="">Select Item</option>
                                {items.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                    </motion.div>
                ))}
            </div>

            {!isReadOnly && (
                <p className="text-center text-xs text-text-muted italic">
                    Use the clues provided to deduce the correct color and item for each person.
                </p>
            )}
        </div>
    );
};

export default DeductionGridComponent;
