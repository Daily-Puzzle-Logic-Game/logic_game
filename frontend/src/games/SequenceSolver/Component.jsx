import { useState } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../../utils/SoundManager';
import { Sparkles } from 'lucide-react';

const SequenceSolverComponent = ({ puzzleState, onUpdate, isReadOnly }) => {
    const { sequence, index } = puzzleState;
    const [userValue, setUserValue] = useState(sequence[index] !== null ? sequence[index] : '');

    const handleChange = (e) => {
        if (isReadOnly) return;
        playSound('bubble_pop');
        const val = e.target.value;
        setUserValue(val);
        const newSequence = [...sequence];
        newSequence[index] = val;
        onUpdate({ ...puzzleState, sequence: newSequence });
    };

    return (
        <div className="flex flex-col items-center gap-10 py-6">
            <div className="flex flex-wrap justify-center gap-4 p-8 bg-zinc-900/60 rounded-[3rem] border border-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.7)] relative overflow-hidden group">
                {/* Rule Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent pointer-events-none" />
                
                {sequence.map((num, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05, y: -5 }}
                        onMouseEnter={() => playSound('hover')}
                        transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
                        className={`
                            w-16 h-16 md:w-24 md:h-24 flex items-center justify-center rounded-[2rem] text-3xl font-black shadow-2xl transition-all duration-300 border-2
                            ${i === index
                                ? 'bg-cyan/10 border-cyan shadow-[0_0_30px_rgba(34,211,238,0.3)] z-10 scale-110'
                                : 'bg-white/5 border-white/5 text-white/80'
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
                                className={`w-full h-full bg-transparent text-center outline-none text-cyan placeholder:text-cyan/20 ${!isReadOnly ? 'animate-pulse' : ''}`}
                                autoFocus
                            />
                        ) : (
                            <span className="text-shadow-glow">{num}</span>
                        )}
                    </motion.div>
                ))}
            </div>

            {!isReadOnly && (
                <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-2 px-6 py-2 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                        <Sparkles size={14} className="text-gold animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Identify Simulation Rule</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SequenceSolverComponent;
