import { useState, useEffect } from 'react';
import api from '../config/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Flame, Trophy, Calendar, CheckCircle, Lock, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGameEngine } from '../hooks/useGameEngine';

const StreakKeeperChallenge = () => {
    const navigate = useNavigate();
    const { user: authUser } = useSelector((state) => state.auth);
    const { user: backendUser, activity, achievements } = useGameEngine();

    const [badgeEarned, setBadgeEarned] = useState(false);
    const [showCompletion, setShowCompletion] = useState(false);

    // Activity is returned as an array of DailyScore records with { date: "YYYY-MM-DD" }
    const completedDays = activity?.map(a => a.date) || [];
    const currentStreak = backendUser?.streakCount || 0;

    useEffect(() => {
        const streakBadge = achievements?.find(a => a.id === 'streak_keeper');

        if (streakBadge) {
            setBadgeEarned(true);
        }

        // Check if 30-day streak achieved
        if (currentStreak >= 30 && !streakBadge) {
            awardBadge();
            setShowCompletion(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentStreak, achievements]);

    const awardBadge = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                await api.post('/api/user/achievement', {
                    badgeType: 'streak_keeper',
                    title: 'Milestone 7 Achieved',
                    message: 'Streak Keeper status confirmed. 30-day logic pulse maintained.'
                });
            }
        } catch (err) {
            console.error('Achievement Sync Error:', err);
        }

        setBadgeEarned(true);
    };

    // Generate 30 days calendar
    const generateCalendar = () => {
        const days = [];
        const today = new Date();

        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            days.push({
                date: dateStr,
                dayNum: 30 - i,
                isCompleted: completedDays.includes(dateStr),
                isToday: i === 0
            });
        }

        return days;
    };

    const calendarDays = generateCalendar();
    const progress = Math.min((currentStreak / 30) * 100, 100);

    if (showCompletion) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-2xl mx-auto px-4 py-12 text-center"
            >
                <div className="bg-white rounded-3xl p-12 shadow-2xl border border-brand-100">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <Flame size={48} />
                    </motion.div>
                    <h1 className="text-4xl font-black text-brand-900 mb-4">
                        30-Day Streak Complete!
                    </h1>
                    <p className="text-text-muted mb-8">
                        Incredible dedication! You've solved puzzles for 30 consecutive days and earned the <strong>Streak Keeper</strong> badge!
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => navigate('/leaderboard')}
                            className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            View Badge
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="px-8 py-3 bg-brand-100 text-brand-900 rounded-xl font-bold hover:bg-brand-200 transition-colors"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-4 py-8"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/leaderboard')}
                        className="p-2 hover:bg-surface rounded-full transition-colors"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-brand-900 flex items-center gap-2">
                            <Flame className="text-orange-500" />
                            Streak Keeper Challenge
                        </h1>
                        <p className="text-sm text-text-muted">Solve daily puzzles for 30 consecutive days</p>
                    </div>
                </div>
                {badgeEarned && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-full">
                        <Award size={18} />
                        <span className="font-bold text-sm">Earned!</span>
                    </div>
                )}
            </div>

            {/* Progress Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-100 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <p className="text-sm text-text-muted">Current Streak</p>
                        <p className="text-4xl font-black text-brand-900">{currentStreak} <span className="text-lg text-text-muted font-normal">/ 30 days</span></p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-text-muted">Progress</p>
                        <p className="text-2xl font-bold text-orange-500">{Math.round(progress)}%</p>
                    </div>
                </div>
                <div className="w-full h-4 bg-brand-100 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1 }}
                    />
                </div>
            </div>

            {/* 30-Day Calendar Grid */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-100">
                <h3 className="text-lg font-bold text-brand-900 mb-6 flex items-center gap-2">
                    <Calendar className="text-primary" />
                    30-Day Journey
                </h3>

                <div className="grid grid-cols-6 sm:grid-cols-10 gap-3">
                    {calendarDays.map((day) => (
                        <motion.div
                            key={day.date}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: day.dayNum * 0.02 }}
                            className={`
                                aspect-square rounded-xl flex flex-col items-center justify-center text-xs font-bold
                                ${day.isCompleted
                                    ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                                    : day.isToday
                                        ? 'bg-primary/10 text-primary border-2 border-primary border-dashed'
                                        : 'bg-gray-100 text-gray-400'
                                }
                            `}
                        >
                            {day.isCompleted ? (
                                <CheckCircle size={16} className="mb-1" />
                            ) : day.isToday ? (
                                <span className="text-[10px]">TODAY</span>
                            ) : (
                                <Lock size={12} className="mb-1" />
                            )}
                            <span>{day.dayNum}</span>
                        </motion.div>
                    ))}
                </div>

                {/* Legend */}
                <div className="mt-6 pt-4 border-t border-brand-100 flex items-center gap-6 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded"></div>
                        <span>Completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-primary/10 border-2 border-primary border-dashed rounded"></div>
                        <span>Today</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-gray-100 rounded"></div>
                        <span>Locked</span>
                    </div>
                </div>
            </div>

            {/* Info Card */}
            <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-6 border border-orange-100">
                <h4 className="font-bold text-brand-900 mb-2 flex items-center gap-2">
                    <Trophy size={18} className="text-orange-500" />
                    How to Earn This Badge
                </h4>
                <ul className="text-sm text-text-muted space-y-2">
                    <li className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                        Solve the daily puzzle every day for 30 consecutive days
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                        Missing a day will reset your streak to zero
                    </li>
                    <li className="flex items-start gap-2">
                        <CheckCircle size={14} className="text-orange-500 mt-0.5 shrink-0" />
                        Your progress is automatically tracked
                    </li>
                </ul>
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
                <button
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-primary text-white rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
                >
                    {currentStreak > 0 ? 'Continue Your Streak' : 'Start Your Streak'}
                </button>
            </div>
        </motion.div>
    );
};

export default StreakKeeperChallenge;
