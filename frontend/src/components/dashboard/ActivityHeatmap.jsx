import React from 'react';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';

/**
 * ActivityHeatmap renders a 365-day grid of puzzle completions.
 * Color intensity represents difficulty level or solve speed.
 */
const ActivityHeatmap = ({ history = [] }) => {
    // Generate last 365 days
    const today = dayjs();
    const days = Array.from({ length: 365 }).map((_, i) => {
        const date = today.subtract(364 - i, 'day');
        const dateStr = date.format('YYYY-MM-DD');
        const record = history.find(h => h.date === dateStr);
        return {
            date: dateStr,
            intensity: record ? record.intensity : 0,
            active: !!record
        };
    });

    const getColor = (intensity) => {
        if (intensity === 0) return 'bg-slate-100 dark:bg-zinc-900/40';
        if (intensity === 1) return 'bg-blue-300 dark:bg-blue-900/40';
        if (intensity === 2) return 'bg-blue-500 dark:bg-blue-700/60';
        if (intensity === 3) return 'bg-blue-600 dark:bg-blue-600/80';
        return 'bg-blue-700 dark:bg-blue-500'; // Expert/Intense
    };

    return (
        <div className="w-full overflow-x-auto pb-4 scrollbar-hide">
            <div className="min-w-[800px]">
                <div className="flex flex-wrap gap-1">
                    {days.map((day, i) => (
                        <motion.div
                            key={day.date}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: i * 0.001 }}
                            className={`w-3 h-3 rounded-sm ${getColor(day.intensity)} transition-colors cursor-pointer relative group`}
                        >
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
                                {day.active ? `Solved on ${day.date}` : `No activity on ${day.date}`}
                            </div>
                        </motion.div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 px-1">
                    <div className="flex items-center gap-2 text-[10px] text-text-muted font-mono uppercase tracking-widest">
                        Less <div className="flex gap-1"><div className="w-3 h-3 bg-slate-100 dark:bg-zinc-900/40 rounded-sm" /><div className="w-3 h-3 bg-blue-700 dark:bg-blue-500 rounded-sm" /></div> More
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityHeatmap;
