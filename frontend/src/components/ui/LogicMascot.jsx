import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Wand2 } from 'lucide-react';

const LogicMascot = ({ state = 'idle', message = '' }) => {
    const variants = {
        idle: {
            y: [0, -8, 0],
            rotate: [0, 2, -2, 0],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        },
        celebrate: {
            scale: [1, 1.2, 1],
            rotate: [0, 360],
            transition: { duration: 0.8, ease: "backOut" }
        },
        thinking: {
            x: [0, -3, 3, 0],
            transition: { duration: 0.2, repeat: Infinity }
        },
        wave: {
            rotate: [0, 20, -20, 20, 0],
            transition: { duration: 1, repeat: 2 }
        },
        retry: {
            y: [0, 10, 0],
            scale: [1, 0.95, 1],
            transition: { duration: 2, repeat: Infinity }
        }
    };

    const getMascotImage = () => {
        switch (state) {
            case 'celebrate': return '/assets/stickers/assistant_cheer.png';
            case 'thinking': return '/assets/stickers/assistant_thinking.png';
            case 'wave': return '/assets/stickers/assistant_pointing.png';
            case 'retry': return '/assets/stickers/assistant_retry.png';
            default: return '/assets/stickers/assistant_idle.png';
        }
    };

    return (
        <div className="relative group">
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 bg-white dark:bg-zinc-900 border border-white/10 p-3 rounded-2xl shadow-2xl text-[11px] font-bold text-center"
                    >
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-white dark:border-t-zinc-900" />
                        {message}
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                variants={variants}
                animate={state}
                className="relative cursor-pointer"
            >
                <motion.img 
                    key={state}
                    initial={{ opacity: 0.5, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={getMascotImage()} 
                    alt="Mascot" 
                    className="w-48 md:w-64 floating-sticker drop-shadow-2xl" 
                />

                {/* Floating Wand for Hints */}
                {state === 'thinking' && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 10, y: -10 }}
                        className="absolute -top-4 -right-2 text-gold z-20"
                    >
                        <Wand2 size={20} className="animate-pulse" />
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default LogicMascot;
