import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Medal } from 'lucide-react';
import MainLayout from '../components/layout/MainLayout';

export default function LeaderboardPage() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all-time'); // 'all-time' or 'daily'

    useEffect(() => {
        const fetchLeaderboard = async () => {
            setLoading(true);
            try {
                let url = 'http://localhost:3000/api/scores/leaderboard';
                if (filter === 'daily') {
                    const today = new Date().toISOString().split('T')[0];
                    url += ?date=;
                }
                const response = await fetch(url);
                if (response.ok) {
                    const data = await response.json();
                    setLeaderboard(data);
                }
            } catch (error) {
                console.error("Failed to fetch leaderboard", error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [filter]);

    return (
        <MainLayout>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto p-4 md:p-8"
            >
                <div className="flex items-center justify-center mb-8">
                    <div className="flex bg-surface rounded-xl p-1 border border-border">
                        <button
                            onClick={() => setFilter('all-time')}
                            className={px-4 py-2 rounded-lg text-sm font-bold transition-colors }
                        >
                            <Trophy size={16} className="inline mr-2" /> Global
                        </button>
                        <button
                            onClick={() => setFilter('daily')}
                            className={px-4 py-2 rounded-lg text-sm font-bold transition-colors }
                        >
                            <Calendar size={16} className="inline mr-2" /> Today
                        </button>
                    </div>
                </div>

                <div className="bg-bg-elevated/40 border border-border rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
                    <div className="p-6 border-b border-border bg-surface/50">
                        <h1 className="text-2xl font-black text-text font-heading tracking-tight flex items-center gap-3">
                            <Medal className="text-secondary" /> 
                            {filter === 'all-time' ? 'Hall of Fame' : 'Daily Champions'}
                        </h1>
                        <p className="text-text-muted text-sm mt-1">
                            {filter === 'all-time' ? 'Top players ranked by total stars earned across all puzzles.' : 'The fastest and highest scoring players today.'}
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center py-20 text-text-muted">
                            No scores recorded yet. Be the first to claim a spot!
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-text-muted text-sm uppercase tracking-wider bg-surface/30">
                                        <th className="py-4 px-6 font-bold">Rank</th>
                                        <th className="py-4 px-6 font-bold">Player</th>
                                        <th className="py-4 px-6 font-bold text-right">Score</th>
                                        {filter === 'daily' && <th className="py-4 px-6 font-bold text-right">Time</th>}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {leaderboard.map((entry, index) => (
                                        <motion.tr
                                            key={entry.id || index}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="hover:bg-surface/50 transition-colors"
                                        >
                                            <td className="py-4 px-6">
                                                <div className={w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm }>
                                                    #{entry.rank}
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 font-medium flex items-center gap-3">
                                                {entry.picture ? (
                                                    <img src={entry.picture} alt="" className="w-8 h-8 rounded-full border border-border" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                                                        {entry.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                                <span className="text-text">{entry.name}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right font-mono font-bold text-secondary">
                                                {entry.score}
                                            </td>
                                            {filter === 'daily' && (
                                                <td className="py-4 px-6 text-right text-text-muted font-mono">
                                                    {entry.time}s
                                                </td>
                                            )}
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </motion.div>
        </MainLayout>
    );
}
