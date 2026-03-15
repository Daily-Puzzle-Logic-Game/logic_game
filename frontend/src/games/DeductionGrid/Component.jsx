import { useState } from 'react';
import { motion } from 'framer-motion';
import { playSound } from '../../utils/SoundManager';
import { Sparkles } from 'lucide-react';

const DeductionGridComponent = ({ puzzleState, onUpdate, isReadOnly }) => {
    const { people, colors, items, clues, gridState } = puzzleState;
    const [localState, setLocalState] = useState(gridState);

    const handleSelect = (person, type, value) => {
        if (isReadOnly) return;
        playSound('bubble_pop');
        const newState = {
            ...localState,
            [person]: { ...localState[person], [type]: value }
        };
        setLocalState(newState);
        onUpdate({ ...puzzleState, gridState: newState });
    };

    return (
        <div className="flex flex-col gap-8 py-4 w-full max-w-3xl mx-auto">
            {/* Logic Clues Terminal */}
            <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/5 p-6 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-cyan/50" />
                <h4 className="flex items-center gap-2 text-[10px] font-black text-cyan uppercase tracking-[0.3em] mb-4">
                    <Sparkles size={12} className="animate-pulse" />
                    Simulation_Logic_Parameters
                </h4>
                <ul className="space-y-3">
                    {clues.map((clue, i) => (
                        <motion.li 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="text-sm text-white/70 flex gap-3 items-start"
                        >
                            <span className="text-cyan font-black mt-1">[{i + 1}]</span>
                            <span className="leading-relaxed">{clue}</span>
                        </motion.li>
                    ))}
                </ul>
            </div>

            {/* Selection Grid */}
            <div className="grid grid-cols-1 gap-4">
                {people.map((person, idx) => (
                    <motion.div
                        key={person}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        whileHover={{ scale: 1.02 }}
                        onMouseEnter={() => playSound('hover')}
                        className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white/5 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all shadow-xl"
                    >
                        <div className="md:col-span-3">
                            <h3 className="text-lg font-black text-white tracking-widest uppercase">{person}</h3>
                            <div className="w-8 h-1 bg-cyan rounded-full mt-1" />
                        </div>

                        <div className="md:col-span-4 flex flex-col gap-2">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-widest pl-1">Sector_Color</label>
                            <select
                                value={localState[person].color || ''}
                                onChange={(e) => handleSelect(person, 'color', e.target.value)}
                                onMouseEnter={() => playSound('hover')}
                                disabled={isReadOnly}
                                className="bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan/50 transition-all cursor-pointer appearance-none"
                            >
                                <option value="">- SELECT -</option>
                                {colors.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="md:col-span-5 flex flex-col gap-2">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-widest pl-1">Data_Object</label>
                            <select
                                value={localState[person].item || ''}
                                onChange={(e) => handleSelect(person, 'item', e.target.value)}
                                onMouseEnter={() => playSound('hover')}
                                disabled={isReadOnly}
                                className="bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan/50 transition-all cursor-pointer appearance-none"
                            >
                                <option value="">- SELECT -</option>
                                {items.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                    </motion.div>
                ))}
            </div>

            {!isReadOnly && (
                <div className="flex justify-center mt-4">
                    <div className="px-4 py-2 bg-white/5 rounded-full border border-white/5 text-[9px] font-black text-white/30 tracking-[0.3em] uppercase">
                        Simulation Loop: Analyzing Constraints...
                    </div>
                </div>
            )}
        </div>
    );
};

export default DeductionGridComponent;
