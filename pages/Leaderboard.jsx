import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Clock, User, ArrowLeft, Award, Target, Flame, LightbulbOff, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';
import api from '../utils/api';
import { getTodayDateString } from '../utils/time';

const Leaderboard = () => {
    const navigate = useNavigate();
    const [scores, setScores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const today = getTodayDateString();
    const puzzleMasterBadge = useLiveQuery(() => db.achievements.get('puzzle_master'));
    const streakKeeperBadge = useLiveQuery(() => db.achievements.get('streak_keeper'));
    const hintlessHeroBadge = useLiveQuery(() => db.achievements.get('hintless_hero'));
    const challengeProgress = useLiveQuery(() => db.dailyProgress.get('puzzle_master_challenge'));
    const hintlessProgress = useLiveQuery(() => db.dailyProgress.get('hintless_hero_challenge'));
    const userData = useLiveQuery(() => db.user.get('local_user'));
    
    const puzzleMasterProgress = challengeProgress?.completedPuzzles?.length || 0;
    const hintlessProgressCount = hintlessProgress?.completedPuzzles?.length || 0;
    const currentStreak = userData?.streakCount || 0;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const response = await api.get(`/game/leaderboard/${today}`);
                setScores(response.data);
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaderboard();
    }, [today]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-4 py-12"
        >
            <div className="flex items-center gap-4 mb-12">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-surface rounded-full transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-3xl font-black text-brand-900 flex items-center gap-3">
                    <Trophy className="text-amber-500" />
                    Global Leaderboard
                </h1>
            </div>

            <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-brand-100">
                <div className="bg-brand-900 text-white p-6 flex justify-between items-center">
                    <span className="font-bold text-sm uppercase tracking-widest opacity-70">Top 100 Solvers • {today}</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brand-50 text-text-muted text-[10px] uppercase tracking-widest font-bold">
                                <th className="px-6 py-4">Rank</th>
                                <th className="px-6 py-4">Player</th>
                                <th className="px-6 py-4 text-center">Score</th>
                                <th className="px-6 py-4 text-center">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-text-muted italic">
                                        Loading rankings...
                                    </td>
                                </tr>
                            ) : scores.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-text-muted italic">
                                        No scores recorded for today yet. Be the first!
                                    </td>
                                </tr>
                            ) : (
                                scores.map((entry, index) => (
                                    <motion.tr
                                        key={entry.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`hover:bg-brand-50/50 transition-colors ${index < 3 ? 'font-bold' : ''}`}
                                    >
                                        <td className="px-6 py-5 shrink-0">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs
                                                ${index === 0 ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-400' :
                                                    index === 1 ? 'bg-slate-100 text-slate-700 ring-2 ring-slate-400' :
                                                        index === 2 ? 'bg-orange-100 text-orange-700 ring-2 ring-orange-400' :
                                                            'text-text-muted'}
                                            `}>
                                                {index + 1}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center overflow-hidden">
                                                    {entry.user.picture ? (
                                                        <img src={entry.user.picture} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={18} className="text-brand-300" />
                                                    )}
                                                </div>
                                                <span className="text-brand-900">{entry.user.name || 'Anonymous Solver'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                                {entry.score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <div className="flex items-center justify-center gap-1.5 text-text-muted text-sm font-mono">
                                                <Clock size={14} />
                                                {Math.floor(entry.timeTaken / 60)}:{(entry.timeTaken % 60).toString().padStart(2, '0')}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Achievements Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-12"
            >
                <h2 className="text-2xl font-black text-brand-900 flex items-center gap-3 mb-6">
                    <Award className="text-primary" />
                    Achievements
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Badge 1: Puzzle Master */}
                    <button
                        onClick={() => navigate('/challenge/puzzle-master')}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-brand-100 hover:shadow-xl transition-all text-left group relative overflow-hidden"
                    >
                        {puzzleMasterBadge && (
                            <div className="absolute top-3 right-3">
                                <Award size={20} className="text-amber-500" />
                            </div>
                        )}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-all ${puzzleMasterBadge ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-600 group-hover:bg-amber-200'}`}>
                            <Target size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-brand-900 mb-2 flex items-center gap-2">
                            Puzzle Master
                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-text-muted mb-3">
                            {puzzleMasterBadge 
                                ? 'Congratulations! You\'ve earned this badge!' 
                                : 'Solve 50 puzzles to earn this badge'}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${puzzleMasterBadge ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700'}`}>
                                {puzzleMasterBadge ? 'Earned!' : `${puzzleMasterProgress}/50 Puzzles`}
                            </span>
                            {!puzzleMasterBadge && puzzleMasterProgress > 0 && (
                                <div className="flex-1 h-2 bg-brand-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-amber-500 rounded-full transition-all"
                                        style={{ width: `${(puzzleMasterProgress / 50) * 100}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Badge 2: Streak Keeper */}
                    <button
                        onClick={() => navigate('/challenge/streak-keeper')}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-brand-100 hover:shadow-xl transition-all text-left group relative overflow-hidden"
                    >
                        {streakKeeperBadge && (
                            <div className="absolute top-3 right-3">
                                <Award size={20} className="text-orange-500" />
                            </div>
                        )}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-all ${streakKeeperBadge ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-600 group-hover:bg-orange-200'}`}>
                            <Flame size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-brand-900 mb-2 flex items-center gap-2">
                            Streak Keeper
                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-text-muted mb-3">
                            {streakKeeperBadge 
                                ? 'Amazing! You maintained a 30-day streak!' 
                                : 'Maintain a 30-day solving streak'}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${streakKeeperBadge ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700'}`}>
                                {streakKeeperBadge ? 'Earned!' : `${currentStreak}/30 Days`}
                            </span>
                            {!streakKeeperBadge && currentStreak > 0 && (
                                <div className="flex-1 h-2 bg-brand-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-orange-500 rounded-full transition-all"
                                        style={{ width: `${Math.min((currentStreak / 30) * 100, 100)}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </button>

                    {/* Badge 3: Hintless Hero */}
                    <button
                        onClick={() => navigate('/challenge/hintless-hero')}
                        className="bg-white rounded-2xl p-6 shadow-lg border border-brand-100 hover:shadow-xl transition-all text-left group relative overflow-hidden"
                    >
                        {hintlessHeroBadge && (
                            <div className="absolute top-3 right-3">
                                <Award size={20} className="text-emerald-500" />
                            </div>
                        )}
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-sm transition-all ${hintlessHeroBadge ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-200'}`}>
                            <LightbulbOff size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-brand-900 mb-2 flex items-center gap-2">
                            Hintless Hero
                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-text-muted mb-3">
                            {hintlessHeroBadge 
                                ? 'Impressive! You solved 10 puzzles without hints!' 
                                : 'Complete 10 puzzles without using hints'}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${hintlessHeroBadge ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                                {hintlessHeroBadge ? 'Earned!' : `${hintlessProgressCount}/10 Puzzles`}
                            </span>
                            {!hintlessHeroBadge && hintlessProgressCount > 0 && (
                                <div className="flex-1 h-2 bg-brand-100 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-emerald-500 rounded-full transition-all"
                                        style={{ width: `${(hintlessProgressCount / 10) * 100}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default Leaderboard;
