/**
 * LeaderboardEngine handles ranking and competitor comparisons.
 */
class LeaderboardEngine {
    /**
     * Finds a rival for the current user.
     * @param {Array} leaderboard - List of { rank, username, score }
     * @param {string} currentUser - Current username
     */
    static getRival(leaderboard, currentUser) {
        if (!leaderboard || leaderboard.length === 0) return null;

        const myIndex = leaderboard.findIndex(u => (u.username === currentUser || u.name === currentUser));
        
        if (myIndex === -1) {
            const bottomPlayer = leaderboard[leaderboard.length - 1];
            const bottomName = bottomPlayer.username || bottomPlayer.name || 'Anonymous';
            return {
                type: 'ENTRY',
                user: bottomPlayer,
                pointsNeeded: (bottomPlayer.score || 0) + 1,
                message: `Beat ${bottomName} to enter the Global Top ${leaderboard.length}.`
            };
        }

        if (myIndex === 0) {
            const runnerUp = leaderboard[1];
            const runnerUpName = runnerUp?.username || runnerUp?.name;
            return {
                type: 'DEFEND',
                user: runnerUp,
                message: runnerUp ? `Defend your #1 spot! ${runnerUpName} is only ${leaderboard[0].score - runnerUp.score} pts behind.` : "You're at the zenith of the global board."
            };
        }

        const rival = leaderboard[myIndex - 1];
        const rivalName = rival.username || rival.name || 'Anonymous';
        const pointsToBeat = (rival.score - leaderboard[myIndex].score) + 1;

        return {
            type: 'BEAT',
            user: rival,
            pointsNeeded: pointsToBeat,
            message: `Beat ${rivalName} to reach Rank #${myIndex}.`
        };
    }

    /**
     * Gets status for the current competitive season.
     */
    static getSeasonalStatus() {
        const now = new Date();
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const daysLeft = Math.ceil((endOfMonth - now) / (1000 * 60 * 60 * 24));
        
        return {
            seasonName: `Season ${now.toLocaleString('default', { month: 'short' })} '26`,
            daysLeft,
            progress: Math.floor((now.getDate() / endOfMonth.getDate()) * 100),
            isEndingSoon: daysLeft <= 3
        };
    }
}

export default LeaderboardEngine;
