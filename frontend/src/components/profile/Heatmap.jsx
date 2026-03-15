import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import './Heatmap.css';

const HeatmapCell = ({ date, activity, delay = 0 }) => {
    let intensity = activity?.intensity || 0;

    // Inferred intensity for legacy records
    if (intensity === 0 && activity?.solved) {
        intensity = activity.difficulty || 1;
        if (activity.score > 100) intensity = 4;
    }

    const isToday = date.isSame(dayjs(), 'day');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.2 }}
            className={`heatmap-cell intensity-${intensity} ${isToday ? 'outline-2 outline-primary outline-offset-1' : ''}`}
            title={`${date.format('MMM DD, YYYY')}: ${activity?.score || 0} points`}
        />
    );
};


const Heatmap = ({ activity = [] }) => {
    const activityMap = useMemo(() => {
        const map = {};
        activity.forEach(entry => {
            if (!map[entry.date]) {
                map[entry.date] = { ...entry };
            } else {
                map[entry.date].score += entry.score;
                map[entry.date].intensity = Math.max(map[entry.date].intensity || 0, entry.intensity || 0);
                map[entry.date].solved = map[entry.date].solved || entry.solved;
            }
        });
        return map;
    }, [activity]);

    const { heatmapColumns, monthLabels } = useMemo(() => {
        const endDate = dayjs();
        const startDate = endDate.subtract(1, 'year').startOf('week');
        const columns = [];
        const labels = [];
        let currentDay = startDate;

        for (let i = 0; i < 53; i++) {
            const week = [];
            let monthAddedForThisWeek = false;

            for (let j = 0; j < 7; j++) {
                // If it's the start of a month and we haven't added a label for this week yet
                if (currentDay.date() <= 7 && !monthAddedForThisWeek) {
                    labels.push({
                        name: currentDay.format('MMM'),
                        index: i
                    });
                    monthAddedForThisWeek = true;
                }

                week.push({
                    date: currentDay,
                    activity: activityMap[currentDay.format('YYYY-MM-DD')]
                });
                currentDay = currentDay.add(1, 'day');
            }
            columns.push(week);
        }
        return { heatmapColumns: columns, monthLabels: labels };
    }, [activityMap]);

    return (
        <div className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-4 font-sans text-[#7d8590]">
            <div className="heatmap-container custom-scrollbar">
                <div className="heatmap-grid-wrapper">
                    {/* Day Labels */}
                    <div className="heatmap-day-labels text-[9px] text-[#7d8590] pt-[19px] pr-2">
                        <span className="h-[10px] mb-[3px] leading-[10px]"></span>
                        <span className="h-[10px] mb-[3px] leading-[10px]">Mon</span>
                        <span className="h-[10px] mb-[3px] leading-[10px]"></span>
                        <span className="h-[10px] mb-[3px] leading-[10px]">Wed</span>
                        <span className="h-[10px] mb-[3px] leading-[10px]"></span>
                        <span className="h-[10px] mb-[3px] leading-[10px]">Fri</span>
                        <span className="h-[10px] leading-[10px]"></span>
                    </div>

                    <div className="heatmap-grid-container flex flex-col gap-1">
                        {/* Month Labels */}
                        <div className="heatmap-month-labels relative mb-1 h-[15px]">
                            {monthLabels.map((label, i) => (
                                <span
                                    key={`${label.name}-${i}`}
                                    className="absolute whitespace-nowrap text-[9px]"
                                    style={{ left: `${label.index * 13}px` }}
                                >
                                    {label.name}
                                </span>
                            ))}
                        </div>

                        {/* The Grid */}
                        <div className="heatmap-grid">
                            {heatmapColumns.map((week, wIndex) => (
                                <div key={`week-${wIndex}`} className="flex flex-col gap-[3px]">
                                    {week.map((day, dIndex) => (
                                        <HeatmapCell
                                            key={day.date.format('YYYY-MM-DD')}
                                            date={day.date}
                                            activity={day.activity}
                                            delay={(wIndex * 0.01) + (dIndex * 0.005)}
                                        />
                                    ))}

                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="heatmap-footer flex justify-end">
                <div className="heatmap-legend">
                    <span>Less</span>
                    <div className="flex gap-[3px]">
                        <div className="legend-box intensity-0" />
                        <div className="legend-box intensity-1" />
                        <div className="legend-box intensity-2" />
                        <div className="legend-box intensity-3" />
                        <div className="legend-box intensity-4" />
                    </div>
                    <span>More</span>
                </div>
            </div>
        </div>
    );
};

export default Heatmap;
