import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector } from 'react-redux';
import { Trophy, Clock, ArrowLeft, Award, Target, LightbulbOff, ChevronRight, Star, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTodayDateString } from '../utils/time';
import RibbonBadge from '../components/common/RibbonBadge';
import { useGameEngine } from '../hooks/useGameEngine';
import LeaderboardEngine from '../engines/LeaderboardEngine';
import ProgressEngine from '../engines/ProgressEngine';
import RankBadge from '../components/ui/RankBadge';
import LeaderboardPodium from '../components/leaderboard/LeaderboardPodium';
import PlayerCard from '../components/leaderboard/PlayerCard';
import RankPromotionSplash from '../components/effects/RankPromotionSplash';
import AnimatedScore from '../components/effects/AnimatedScore';
import { Activity as ActivityIcon } from 'lucide-react';

const Leaderboard = () => {
    const navigate = useNavigate();
    const { user: authUser } = useSelector((state) => state.auth);
    const { user: backendUser, activity, achievements } = useGameEngine();

    const [apiScores, setApiScores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const activeUser = backendUser || authUser;
    const activeUserId = activeUser?.id || 'local_user';

    const rivalInfo = useMemo(() => {
        return LeaderboardEngine.getRival(apiScores, activeUser?.name || activeUser?.username || 'Local User');
    }, [apiScores, activeUser]);

    const seasonalInfo = useMemo(() => LeaderboardEngine.getSeasonalStatus(), []);
    const levelInfo = useMemo(() => ProgressEngine.getCurrentLevelInfo(activeUser), [activeUser]);

    const [showPromotion, setShowPromotion] = useState(false);
    const prevRankNameRef = useRef(null);
    const [isApiOffline, setIsApiOffline] = useState(false);
    const [leaderboardType, setLeaderboardType] = useState('daily'); // 'daily' or 'all-time'
    const today = getTodayDateString();

    const puzzleMasterBadge = achievements?.find(a => a.id === 'puzzle_master');
    const streakKeeperBadge = achievements?.find(a => a.id === 'streak_keeper');
    const hintlessHeroBadge = achievements?.find(a => a.id === 'hintless_hero');

    const puzzleMasterProgress = activeUser?.stats?.puzzlesSolved || 0;
    const hintlessProgressCount = activity?.filter(a => a.hintsUsed === 0 && a.solved)?.length || 0;
    const currentStreak = activeUser?.streakCount || 0;

    // Watch for rank promotion
    useEffect(() => {
        const currentRankName = levelInfo?.name;
        if (currentRankName && prevRankNameRef.current && currentRankName !== prevRankNameRef.current) {
            setShowPromotion(true);
        }
        prevRankNameRef.current = currentRankName;
    }, [levelInfo?.name]);

    useEffect(() => {
        let isMounted = true;
        const fetchLeaderboard = async () => {
            setIsLoading(true);
            try {
                const url = leaderboardType === 'daily' 
                    ? `/api/scores/leaderboard?date=${today}` 
                    : `/api/scores/leaderboard`;
                    
                const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
                const response = await fetch(`${API_URL}${url}`);
                if (response.ok) {
                    const data = await response.json();
                    if(isMounted) {
                        setApiScores(data);
                        setIsApiOffline(false);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.warn('Backend API not reachable.');
                if (isMounted) setIsApiOffline(true);
            } 
            if (isMounted) setIsLoading(false);
        };
        fetchLeaderboard();
        return () => { isMounted = false; };
    }, [today, leaderboardType]);

    const finalScores = useMemo(() => {
        return apiScores.map(score => ({
            ...score,
            username: score.username || score.name || 'Anonymous', // Normalize name/username
            isLocalUser: (activeUserId && score.id === activeUserId) || (!activeUserId && score.id === 'local_user')
        }));
    }, [apiScores, activeUserId]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto px-4 py-12"
        >
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="p-2 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-slate-900 dark:text-white" />
                </button>
                <div className="flex-1 relative">
                    <span className="font-mono text-[10px] tracking-[0.5em] text-blue-500 uppercase font-black block mb-1">COMPETITIVE_LADDER</span>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-slate-950 dark:text-white flex items-center gap-3">
                        <Trophy className="text-blue-500 animate-pulse" />
                        Global Leaderboard
                    </h1>

                    {/* Anime Assistant Sticker - Leaderboard */}
                    <div className="absolute -right-32 -top-16 hidden lg:block pointer-events-none">
                        <img 
                            src="/assets/stickers/assistant_trophy.png" 
                            alt="Trophy Assistant" 
                            className="w-40 floating-sticker drop-shadow-xl" 
                        />
                    </div>
                </div>
            </div>

            {/* Redesigned Competitive Dashboard */}
            <div className="bg-slate-50 dark:bg-[#0c0c0e] rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/5 relative">
                
                {/* Dashboard Header Bar */}
                <div className="bg-slate-900 dark:bg-black p-4 md:p-6 flex flex-col md:flex-row justify-between items-center border-b border-white/10 relative overflow-hidden gap-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none"></div>
                    <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                        <span className="font-mono text-xs md:text-sm uppercase tracking-widest text-slate-300 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                            {leaderboardType === 'daily' ? 'Daily Top 100' : 'Global All-Time'}
                        </span>
                    </div>

                    <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5 relative z-10 w-full md:w-auto">
                        <button 
                            onClick={() => setLeaderboardType('daily')}
                            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all
                                ${leaderboardType === 'daily' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}
                            `}
                        >
                            Daily
                        </button>
                        <button 
                            onClick={() => setLeaderboardType('all-time')}
                            className={`flex-1 md:flex-none px-4 py-1.5 rounded-lg font-mono text-[10px] uppercase tracking-wider transition-all
                                ${leaderboardType === 'all-time' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}
                            `}
                        >
                            All Time
                        </button>
                    </div>

                    <span className="font-mono text-xs text-blue-500 tracking-widest relative z-10 border border-blue-500/30 px-3 py-1 rounded bg-blue-500/10 hidden md:block">
                        {leaderboardType === 'daily' ? today : 'LEGACY_DATA'}
                    </span>
                </div>

                {/* Competitive Standing */}
                <div className="bg-black/60 border-b border-white/5 p-8 flex flex-col md:flex-row gap-8 items-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
                    
                    <div className="flex items-center gap-8 flex-1 w-full relative z-10">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <RankBadge rank={levelInfo} size="lg" showLabel />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] truncate">Training_Progress: {levelInfo.name} {levelInfo.subRank}</span>
                                <span className="text-xs font-black text-blue-400 font-mono tracking-tighter"><AnimatedScore value={activeUser?.totalPoints || activeUser?.totalXP || 0} /> / {levelInfo.nextLevelXP || '---'} PTS</span>
                            </div>
                            <div className="w-full h-3 bg-black/40 rounded-full border border-white/5 overflow-hidden shadow-inner p-0.5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${levelInfo.progress}%` }}
                                    className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="hidden md:block w-px h-16 bg-white/5" />
                    
                    <div className="flex flex-col items-center md:items-end relative z-10 py-2">
                        <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.3em] mb-2 leading-none">Simulation_Reset</span>
                        <div className="flex items-center gap-3 text-3xl font-black text-white italic tracking-tighter">
                            <Clock size={24} className="text-cyan animate-pulse" />
                            {seasonalInfo.daysLeft}D
                        </div>
                        <div className="text-[9px] font-black text-cyan/40 uppercase mt-2 tracking-widest">{seasonalInfo.seasonName}</div>
                    </div>
                </div>

                {/* Rival System Briefing */}
                <AnimatePresence>
                    {rivalInfo && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="bg-blue-600/5 border-b border-blue-500/20 px-8 py-5 flex flex-col md:flex-row items-center gap-6 group overflow-hidden relative"
                        >
                            <div className="absolute left-0 w-1 h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
                            
                            <div className="flex items-center gap-6 flex-1">
                                <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 border border-blue-500/30 shadow-inner group-hover:scale-110 transition-transform">
                                    <Target size={28} className="animate-pulse" />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping" />
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em]">Target_Acquired</span>
                                    </div>
                                    <p className="text-base font-black text-slate-800 dark:text-white italic tracking-tight">
                                        {rivalInfo.message} 
                                        {rivalInfo.pointsNeeded && <span className="ml-3 text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.4)]">+{rivalInfo.pointsNeeded} PTS needed.</span>}
                                    </p>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => navigate('/journey')}
                                className="w-full md:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-600/30 hover:shadow-blue-500/50 hover:-translate-y-1 active:scale-95 group/btn"
                            >
                                START_SEQUENCE
                                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Podium for top 3 */}
                {!isLoading && !isApiOffline && leaderboardType === 'daily' && finalScores.length >= 3 && (
                    <LeaderboardPodium topPlayers={finalScores.slice(0, 3)} />
                )}

                {/* Ladder ladder */}
                <div className="p-4 md:p-6 bg-transparent">
                    <div className="flex flex-col">
                        {isLoading ? (
                            <div className="p-12 text-center text-slate-500 font-mono text-sm animate-pulse flex flex-col items-center gap-4">
                                <ActivityIcon className="animate-spin text-blue-500" size={32} />
                                Synchronizing Neural Ladder...
                            </div>
                        ) : isApiOffline ? (
                            <div className="p-12 text-center text-red-500/70 font-mono text-sm flex flex-col items-center gap-3">
                                <Target className="animate-spin text-red-500" size={24} />
                                System core connection severed. Unable to retrieve ranked data.
                            </div>
                        ) : finalScores.length === 0 ? (
                            <div className="p-12 text-center text-slate-500 font-mono text-sm flex flex-col items-center gap-3">
                                <LightbulbOff className="text-blue-500/50" size={24} />
                                No competitive signals detected for this sector.
                                <button 
                                    onClick={() => navigate('/')}
                                    className="mt-6 px-10 py-4 bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.3em] shadow-2xl hover:bg-blue-500 transition-all"
                                >
                                    Be the Pioneer
                                </button>
                            </div>
                        ) : (
                            <motion.div layout className="flex flex-col">
                                {finalScores.slice((leaderboardType === 'daily' && finalScores.length >= 3) ? 3 : 0).map((entry, index) => (
                                    <PlayerCard 
                                        key={entry.id || entry.username || index}
                                        player={entry}
                                        rank={index + ((leaderboardType === 'daily' && finalScores.length >= 3) ? 4 : 1)}
                                        isCurrentUser={entry.isLocalUser}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>

            {/* Promotion Celebration */}
            <RankPromotionSplash 
                isOpen={showPromotion}
                newRank={levelInfo}
                onClose={() => setShowPromotion(false)}
            />

            {/* Achievements Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-12"
            >
                <h2 className="text-2xl font-black text-brand-900 flex items-center gap-3 mb-6 dark:text-white">
                    <Award className="text-primary" />
                    Achievements
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Badge 1: Puzzle Master */}
                    <button
                        onClick={() => navigate('/challenge/puzzle-master')}
                        className="bg-white dark:bg-black/40 dark:border-white/5 rounded-2xl p-6 shadow-lg border border-brand-100 hover:shadow-xl transition-all text-left group relative overflow-hidden"
                    >
                        {puzzleMasterBadge && (
                            <div className="absolute top-3 right-3">
                                <Award size={20} className="text-amber-500" />
                            </div>
                        )}
                        <div className="w-16 h-16 flex items-center justify-center mb-4 transition-all duration-300">
                            <RibbonBadge 
                                type="gold" 
                                shape="star"
                                icon={Star}
                                size={76} 
                                className={`-translate-y-2 drop-shadow-xl transition-all duration-300 ${!puzzleMasterBadge ? 'grayscale opacity-40' : ''}`} 
                            />
                        </div>
                        <h3 className="text-lg font-bold text-brand-900 dark:text-white mb-2 flex items-center gap-2">
                            Puzzle Master
                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-text-muted dark:text-zinc-500 mb-3">
                            {puzzleMasterBadge ? "Congratulations! You've earned this badge!" : "Solve 50 puzzles to earn this badge"}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${puzzleMasterBadge ? 'bg-amber-500 text-white' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-500'}`}>
                                {puzzleMasterBadge ? 'Earned!' : `${puzzleMasterProgress}/50 Puzzles`}
                            </span>
                            {!puzzleMasterBadge && puzzleMasterProgress > 0 && (
                                <div className="flex-1 h-2 bg-brand-100 dark:bg-zinc-900 rounded-full overflow-hidden">
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
                        className="bg-white dark:bg-black/40 dark:border-white/5 rounded-2xl p-6 shadow-lg border border-brand-100 hover:shadow-xl transition-all text-left group relative overflow-hidden"
                    >
                        {streakKeeperBadge && (
                            <div className="absolute top-3 right-3">
                                <Award size={20} className="text-orange-500" />
                            </div>
                        )}
                        <div className="w-16 h-16 flex items-center justify-center mb-4 transition-all duration-300">
                            <RibbonBadge 
                                type="silver" 
                                shape="shield"
                                icon={Flame}
                                size={76} 
                                className={`-translate-y-2 drop-shadow-xl transition-all duration-300 ${!streakKeeperBadge ? 'grayscale opacity-40' : ''}`} 
                            />
                        </div>
                        <h3 className="text-lg font-bold text-brand-900 dark:text-white mb-2 flex items-center gap-2">
                            Streak Keeper
                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-text-muted dark:text-zinc-500 mb-3">
                            {streakKeeperBadge ? "Amazing! You maintained a 30-day streak!" : "Maintain a 30-day solving streak"}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${streakKeeperBadge ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-500'}`}>
                                {streakKeeperBadge ? 'Earned!' : `${currentStreak}/30 Days`}
                            </span>
                            {!streakKeeperBadge && currentStreak > 0 && (
                                <div className="flex-1 h-2 bg-brand-100 dark:bg-zinc-900 rounded-full overflow-hidden">
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
                        className="bg-white dark:bg-black/40 dark:border-white/5 rounded-2xl p-6 shadow-lg border border-brand-100 hover:shadow-xl transition-all text-left group relative overflow-hidden"
                    >
                        {hintlessHeroBadge && (
                            <div className="absolute top-3 right-3">
                                <Award size={20} className="text-emerald-500" />
                            </div>
                        )}
                        <div className="w-16 h-16 flex items-center justify-center mb-4 transition-all duration-300">
                            <RibbonBadge 
                                type="bronze" 
                                shape="hexagon"
                                icon={LightbulbOff}
                                size={76} 
                                className={`-translate-y-2 drop-shadow-xl transition-all duration-300 ${!hintlessHeroBadge ? 'grayscale opacity-40' : ''}`} 
                            />
                        </div>
                        <h3 className="text-lg font-bold text-brand-900 dark:text-white mb-2 flex items-center gap-2">
                            Hintless Hero
                            <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-sm text-text-muted dark:text-zinc-500 mb-3">
                            {hintlessHeroBadge ? "Impressive! You solved 10 puzzles without hints!" : "Complete 10 puzzles without using hints"}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${hintlessHeroBadge ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-500'}`}>
                                {hintlessHeroBadge ? 'Earned!' : `${hintlessProgressCount}/10 Puzzles`}
                            </span>
                            {!hintlessHeroBadge && hintlessProgressCount > 0 && (
                                <div className="flex-1 h-2 bg-brand-100 dark:bg-zinc-900 rounded-full overflow-hidden">
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
