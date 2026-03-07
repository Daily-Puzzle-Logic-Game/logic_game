import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrAfter);

/**
 * Returns the current Game Date in YYYY-MM-DD format based on local time.
 */
export const getTodayDateString = () => {
    return dayjs().format('YYYY-MM-DD');
};

/**
 * Returns the number of seconds remaining until the next local midnight.
 * Used to trigger a refresh/reset when the day flips.
 */
export const getSecondsUntilMidnight = () => {
    const now = dayjs();
    const nextMidnight = dayjs().endOf('day');
    return nextMidnight.diff(now, 'second');
};

/**
 * Evaluates if a streak should be reset.
 * @param {string} lastPlayedDate - 'YYYY-MM-DD' that the user last completed a puzzle
 * @returns {boolean} True if the streak is broken (missed yesterday)
 */
export const isStreakBroken = (lastPlayedDate) => {
    if (!lastPlayedDate) return false;

    const today = dayjs().startOf('day');
    const lastPlayed = dayjs(lastPlayedDate, 'YYYY-MM-DD').startOf('day');

    // If the difference between today and the last played day is MORE than 1 day,
    // it means they missed a day, and the streak is broken.
    const diffDays = today.diff(lastPlayed, 'day');
    return diffDays > 1;
};

/**
 * Formats a raw second count into MM:SS for the UI.
 */
export const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
