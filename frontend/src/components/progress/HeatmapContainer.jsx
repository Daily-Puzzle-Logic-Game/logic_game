import { memo, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { Flame } from 'lucide-react';
import { buildYearCalendar, getIntensityLevel, mapActivityByDate } from '../../utils/engagement';

const intensityClassMap = {
  0: 'bg-slate-200',
  1: 'bg-emerald-200',
  2: 'bg-emerald-400',
  3: 'bg-emerald-600',
  4: 'bg-emerald-800'
};

const weekdayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const HeatmapCell = memo(function HeatmapCell({ dayEntry, onHover, onLeave }) {
  if (!dayEntry) {
    return <div className="h-3.5 w-3.5 rounded-[4px] bg-transparent" aria-hidden />;
  }

  const intensity = getIntensityLevel(dayEntry.activity);

  return (
    <button
      type="button"
      onMouseEnter={(event) => onHover(event, dayEntry)}
      onMouseLeave={onLeave}
      className={`h-3.5 w-3.5 rounded-[4px] border border-white/20 transition-transform hover:scale-110 ${intensityClassMap[intensity]}`}
      aria-label={`${dayEntry.date} intensity ${intensity}`}
    />
  );
});

const HeatmapColumn = memo(function HeatmapColumn({ week, onHover, onLeave }) {
  return (
    <div className="flex flex-col gap-1">
      {week.map((dayEntry, index) => (
        <HeatmapCell
          key={dayEntry ? dayEntry.date : `empty-${index}`}
          dayEntry={dayEntry}
          onHover={onHover}
          onLeave={onLeave}
        />
      ))}
    </div>
  );
});

const HeatmapGrid = ({ weeks, onHover, onLeave }) => {
  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {weeks.map((week, index) => (
        <HeatmapColumn
          key={`week-${index}`}
          week={week}
          onHover={onHover}
          onLeave={onLeave}
        />
      ))}
    </div>
  );
};

const Tooltip = ({ tooltip }) => {
  if (!tooltip) return null;

  return (
    <div
      className="pointer-events-none fixed z-50 rounded-lg border border-surface/60 bg-background/95 px-3 py-2 text-xs shadow-xl"
      style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
    >
      <p className="font-semibold text-text-main">{dayjs(tooltip.date).format('DD MMM YYYY')}</p>
      <p className="text-text-muted">Solved: {tooltip.activity?.solved ? 'Yes' : 'No'}</p>
      <p className="text-text-muted">Score: {tooltip.activity?.score ?? 0}</p>
      <p className="text-text-muted">Time: {tooltip.activity?.timeTaken ?? 0}s</p>
      <p className="text-text-muted">Difficulty: {tooltip.activity?.difficulty ?? 0}</p>
    </div>
  );
};

const HeatmapContainer = ({ activity = [], currentStreak = 0 }) => {
  const [tooltip, setTooltip] = useState(null);

  const { weeks, totalSolved } = useMemo(() => {
    const days = buildYearCalendar(dayjs().year());
    const activityByDate = mapActivityByDate(activity);

    const dayEntries = days.map((dateObj) => {
      const date = dateObj.format('YYYY-MM-DD');
      return {
        date,
        activity: activityByDate[date] || { date, solved: false, score: 0, timeTaken: 0, difficulty: 0 }
      };
    });

    const startOffset = days[0].day();
    const paddedEntries = [
      ...Array.from({ length: startOffset }, () => null),
      ...dayEntries
    ];

    const calendarWeeks = [];
    for (let i = 0; i < paddedEntries.length; i += 7) {
      calendarWeeks.push(paddedEntries.slice(i, i + 7));
    }

    const solved = dayEntries.filter((item) => item.activity.solved).length;
    return { weeks: calendarWeeks, totalSolved: solved };
  }, [activity]);

  const handleHover = (event, dayEntry) => {
    setTooltip({
      x: event.clientX,
      y: event.clientY,
      date: dayEntry.date,
      activity: dayEntry.activity
    });
  };

  return (
    <section className="relative rounded-2xl border border-surface/60 bg-surface/60 p-5 shadow-xl">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-text-muted">Daily Engagement</p>
          <h3 className="text-xl font-bold text-text-main">Contribution Heatmap</h3>
        </div>
        <div className="flex items-center gap-4">
          <div className="rounded-xl bg-background px-3 py-2 text-center">
            <p className="text-lg font-bold text-primary">{totalSolved}</p>
            <p className="text-[10px] uppercase tracking-wider text-text-muted">Solved</p>
          </div>
          <div className="rounded-xl bg-background px-3 py-2 text-center">
            <p className="flex items-center justify-center gap-1 text-lg font-bold text-accent"><Flame size={16} />{currentStreak}</p>
            <p className="text-[10px] uppercase tracking-wider text-text-muted">Streak</p>
          </div>
        </div>
      </div>

      <div className="mb-3 flex items-center gap-1 text-[10px] text-text-muted">
        {weekdayLabels.map((label, index) => (
          <span key={`${label}-${index}`} className="w-3.5 text-center">{label}</span>
        ))}
      </div>

      <HeatmapGrid weeks={weeks} onHover={handleHover} onLeave={() => setTooltip(null)} />

      <div className="mt-4 flex items-center gap-2 text-[10px] uppercase tracking-wider text-text-muted">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <span key={level} className={`h-3.5 w-3.5 rounded-[4px] border border-white/20 ${intensityClassMap[level]}`} />
        ))}
        <span>More</span>
      </div>

      <Tooltip tooltip={tooltip} />
    </section>
  );
};

export default HeatmapContainer;
