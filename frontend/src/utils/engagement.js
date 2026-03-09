import dayjs from 'dayjs';

export const DEFAULT_DIFFICULTY = 2;

export const buildYearCalendar = (year = dayjs().year()) => {
  const startOfYear = dayjs().year(year).startOf('year');
  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInYear = isLeapYear ? 366 : 365;
  return Array.from({ length: daysInYear }, (_, index) => startOfYear.add(index, 'day'));
};

export const calculateCurrentStreak = (activityByDate) => {
  let streak = 0;
  let cursor = dayjs().startOf('day');

  while (activityByDate[cursor.format('YYYY-MM-DD')]?.solved) {
    streak += 1;
    cursor = cursor.subtract(1, 'day');
  }

  return streak;
};

export const calculateSuccessRate = (entries) => {
  if (!entries || entries.length === 0) return 0;
  const solvedCount = entries.filter((entry) => entry.solved).length;
  return Math.round((solvedCount / entries.length) * 100);
};

export const calculateAverage = (entries, key) => {
  if (!entries || entries.length === 0) return 0;
  const total = entries.reduce((sum, entry) => sum + (Number(entry[key]) || 0), 0);
  return Math.round(total / entries.length);
};

export const getIntensityLevel = (entry) => {
  if (!entry?.solved) return 0;

  const score = Number(entry.score) || 0;
  const timeTaken = Number(entry.timeTaken) || 0;
  const difficulty = Number(entry.difficulty) || DEFAULT_DIFFICULTY;

  if (score >= 95 && timeTaken > 0 && timeTaken <= 90 && difficulty >= 3) return 4;
  if (difficulty >= 3 || score >= 90) return 3;
  if (difficulty === 2 || score >= 70) return 2;
  return 1;
};

export const deriveDifficultyLevel = ({ averageSolveTime, averageHintsUsed, successRate }) => {
  let level = DEFAULT_DIFFICULTY;

  if (successRate >= 85 && averageSolveTime > 0 && averageSolveTime <= 100 && averageHintsUsed <= 0.6) {
    level += 1;
  }

  if (successRate <= 55 || averageSolveTime >= 220 || averageHintsUsed >= 2) {
    level -= 1;
  }

  return Math.min(4, Math.max(1, level));
};

export const mapActivityByDate = (entries = []) => {
  return entries.reduce((accumulator, entry) => {
    accumulator[entry.date] = entry;
    return accumulator;
  }, {});
};
