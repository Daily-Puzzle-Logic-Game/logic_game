import { useState } from 'react';
import { motion } from 'framer-motion';

const BinaryLogicComponent = ({ puzzleState, onUpdate, isReadOnly }) => {
    const { inputs, gates, target } = puzzleState;
    const [localInputs, setLocalInputs] = useState(inputs);

    const toggleInput = (key) => {
        if (isReadOnly || inputs[key] !== null) return;

        const newValue = localInputs[key] === 1 ? 0 : 1;
        const newState = { ...localInputs, [key]: newValue };
        setLocalInputs(newState);
        onUpdate({ ...puzzleState, inputs: newState });
    };

    const InputNode = ({ label, currentKey }) => (
        <div className="flex flex-col items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-text-muted">{label}</span>
            <motion.button
                whileHover={!isReadOnly && inputs[currentKey] === null ? { scale: 1.1 } : {}}
                whileTap={!isReadOnly && inputs[currentKey] === null ? { scale: 0.9 } : {}}
                onClick={() => toggleInput(currentKey)}
                disabled={isReadOnly || inputs[currentKey] !== null}
                className={`
                    w-12 h-12 rounded-lg font-mono text-xl font-bold flex items-center justify-center transition-all shadow-md
                    ${localInputs[currentKey] === 1 ? 'bg-primary text-white' : 'bg-surface text-text-main border border-surface'}
                    ${inputs[currentKey] === null ? 'ring-2 ring-primary/20' : 'opacity-80 cursor-not-allowed'}
                `}
            >
                {localInputs[currentKey] === null ? '?' : localInputs[currentKey]}
            </motion.button>
        </div>
    );

    const GateNode = ({ type }) => (
        <div className="bg-background border-2 border-primary/40 px-3 py-1 rounded-full font-mono font-bold text-primary text-xs shadow-inner">
            {type}
        </div>
    );

    return (
        <div className="flex flex-col items-center py-6 w-full max-w-md mx-auto">
            <h3 className="text-sm font-bold text-text-muted uppercase tracking-widest mb-10">Logic Circuit</h3>

            <div className="flex flex-col items-center gap-6 relative">
                {/* Inputs Row */}
                <div className="flex gap-12">
                    <InputNode label="A" currentKey="a" />
                    <InputNode label="B" currentKey="b" />
                </div>

                {/* Gate 1 */}
                <GateNode type={gates.gate1} />

                {/* Second Level Row */}
                <div className="flex items-center gap-12">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-px h-6 bg-primary/20"></div>
                        <GateNode type={gates.gate2} />
                    </div>
                    <InputNode label="C" currentKey="c" />
                </div>

                {/* Target Output */}
                <div className="mt-4 flex flex-col items-center gap-1">
                    <span className="text-[10px] uppercase font-bold text-text-muted">Target Output</span>
                    <div className={`
                        w-16 h-16 rounded-full flex items-center justify-center text-3xl font-mono font-bold shadow-xl border-4
                        ${target === 1 ? 'border-accent bg-accent/10 text-accent' : 'border-error bg-error/10 text-error'}
                    `}>
                        {target}
                    </div>
                </div>

                {/* Schematic lines (SVG) */}
                <svg className="absolute inset-0 -z-10 w-full h-full opacity-20" overflow="visible">
                    <path d="M-60,0 L0,30" className="stroke-primary stroke-2" fill="none" />
                </svg>
            </div>

            {!isReadOnly && (
                <p className="mt-12 text-center text-xs text-text-muted max-w-xs leading-relaxed">
                    Adjust the unknown inputs <strong>(?)</strong> so the final output matches the target value.
                </p>
            )}
        </div>
    );
};

export default BinaryLogicComponent;
