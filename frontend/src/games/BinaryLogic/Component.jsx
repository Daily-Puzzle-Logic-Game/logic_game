import { useState } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../../utils/SoundManager';

const BinaryLogicComponent = ({ puzzleState, onUpdate, isReadOnly }) => {
    const { inputs, gates, target } = puzzleState;
    const [localInputs, setLocalInputs] = useState(inputs);

    const toggleInput = (key) => {
        if (isReadOnly || inputs[key] !== null) return;
        playSound('slide_clack');
        const newValue = localInputs[key] === 1 ? 0 : 1;
        const newState = { ...localInputs, [key]: newValue };
        setLocalInputs(newState);
        onUpdate({ ...puzzleState, inputs: newState });
    };

    const InputNode = ({ label, currentKey }) => (
        <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">{label}</span>
            <motion.button
                whileHover={!isReadOnly && inputs[currentKey] === null ? { scale: 1.1, y: -2 } : {}}
                whileTap={!isReadOnly && inputs[currentKey] === null ? { scale: 0.9 } : {}}
                onMouseEnter={() => !isReadOnly && inputs[currentKey] === null && playSound('hover')}
                onClick={() => toggleInput(currentKey)}
                disabled={isReadOnly || inputs[currentKey] !== null}
                className={`
                    w-14 h-14 md:w-16 md:h-16 rounded-2xl font-mono text-2xl font-black flex items-center justify-center transition-all shadow-2xl border-2
                    ${localInputs[currentKey] === 1 
                        ? 'bg-cyan/20 border-cyan text-cyan shadow-[0_0_20px_rgba(34,211,238,0.4)]' 
                        : 'bg-zinc-900 border-white/10 text-white/40'
                    }
                    ${inputs[currentKey] !== null ? 'opacity-90 cursor-not-allowed border-dashed' : 'hover:border-white/30'}
                `}
            >
                {localInputs[currentKey] === null ? '?' : localInputs[currentKey]}
            </motion.button>
        </div>
    );

    const GateNode = ({ type }) => (
        <div className="relative group">
            <div className="absolute -inset-1 bg-cyan/20 blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative bg-zinc-950 border border-white/10 px-6 py-2 rounded-xl font-mono font-black text-cyan text-xs shadow-inner uppercase tracking-widest">
                {type}
            </div>
        </div>
    );

    return (
        <div className="flex flex-col items-center py-8 w-full max-w-lg mx-auto bg-zinc-900/40 backdrop-blur-xl rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden relative">
            {/* Grid Pattern Background */}
            <div className="absolute inset-0 industrial-grid opacity-20 pointer-events-none" />
            
            <h3 className="relative text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-12">Neural_Logic_Circuit</h3>

            <div className="flex flex-col items-center gap-10 relative z-10">
                {/* Inputs Row */}
                <div className="flex gap-16 relative">
                    <InputNode label="Node_A" currentKey="a" />
                    <InputNode label="Node_B" currentKey="b" />
                </div>

                {/* Gate 1 */}
                <div className="relative flex flex-col items-center">
                    <div className="w-1 h-10 bg-gradient-to-b from-cyan/30 to-cyan/10" />
                    <GateNode type={gates.gate1} />
                </div>

                {/* Second Level Row */}
                <div className="flex items-center gap-20">
                    <div className="flex flex-col items-center">
                        <div className="w-1 h-10 bg-gradient-to-b from-cyan/30 to-cyan/10" />
                        <GateNode type={gates.gate2} />
                    </div>
                    <div className="pt-10">
                        <InputNode label="Node_C" currentKey="c" />
                    </div>
                </div>

                {/* Connector Lines (Pure CSS/Borders for simplicity & performance) */}
                <div className="w-1 h-10 bg-gradient-to-b from-cyan/30 to-transparent" />

                {/* Target Output */}
                <div className="flex flex-col items-center gap-3">
                    <span className="text-[10px] font-black uppercase text-white/30 tracking-widest">Expected_Result</span>
                    <motion.div 
                        animate={{ 
                            scale: [1, 1.05, 1],
                            boxShadow: target === 1 ? '0 0 30px rgba(34,211,238,0.4)' : '0 0 30px rgba(244,63,94,0.4)'
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className={`
                            w-20 h-20 rounded-full flex items-center justify-center text-4xl font-mono font-black border-4
                            ${target === 1 
                                ? 'border-cyan bg-cyan/10 text-cyan' 
                                : 'border-rose-500 bg-rose-500/10 text-rose-500'
                            }
                        `}
                    >
                        {target}
                    </motion.div>
                </div>
            </div>

            {!isReadOnly && (
                <div className="mt-12 px-8 py-4 bg-white/5 rounded-2xl border border-white/5 max-w-xs text-center">
                    <p className="text-[9px] font-bold text-white/40 leading-relaxed uppercase tracking-wider">
                        Reconfigure node parameters (?) to satisfy terminal logic constraints.
                    </p>
                </div>
            )}
        </div>
    );
};

export default BinaryLogicComponent;
