import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Flame, Star, LogOut, ShieldCheck, Zap, Award, 
    Flame as FlameIcon, ChevronRight, Layout, Trophy, Target 
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { useGameEngine } from '../hooks/useGameEngine';
import Heatmap from '../components/profile/Heatmap';
import RibbonBadge from '../components/common/RibbonBadge';
import RankBadge from '../components/ui/RankBadge';
import ProgressEngine from '../engines/ProgressEngine';
import AnimatedScore from '../components/effects/AnimatedScore';
import { ACHIEVEMENTS, CATEGORIES } from '../config/achievements';
import BadgeCard from '../components/ui/BadgeCard';
import BadgeModal from '../components/ui/BadgeModal';

const StatCard = ({ icon, value, label, color }) => (
    <motion.div 
        whileHover={{ y: -5, scale: 1.02 }}
        className="bg-background dark:bg-black/40 rounded-xl p-4 text-center border border-surface dark:border-white/5 shadow-sm hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5"
    >
        <div className={`text-3xl font-mono font-bold ${color} mb-1 flex items-center justify-center gap-2`}>
            {label === 'Pulse Streak' && value > 0 ? (
                <motion.div
                    animate={{ 
                        scale: [1, 1.2, 1],
                        filter: ['drop-shadow(0 0 2px #ef4444)', 'drop-shadow(0 0 8px #f97316)', 'drop-shadow(0 0 2px #ef4444)']
                    }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                >
                    <Flame size={24} className="text-orange-500 fill-orange-500" />
                </motion.div>
            ) : icon}
            {value}
        </div>
        <div className="text-[10px] text-text-muted uppercase tracking-widest font-black leading-none">{label}</div>
    </motion.div>
);

const ProfileCenter = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const location = useLocation();
    
    // Auto-detect tab from URL or query param
    const activeTab = useMemo(() => {
        const tabParam = searchParams.get('tab');
        if (tabParam) return tabParam;
        if (location.pathname.includes('achievements')) return 'achievements';
        return 'overview';
    }, [searchParams, location.pathname]);

    const { user: authUser, isAuthenticated, isGuest } = useSelector((state) => state.auth);
    const { user: backendUser, activity, achievements: backendAchievements } = useGameEngine();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Achievements Specific State
    const [activeCategory, setActiveCategory] = useState('Gameplay');
    const [selectedBadge, setSelectedBadge] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const isUserActive = isAuthenticated || isGuest;
    const activeUser = backendUser || authUser;
    const levelInfo = ProgressEngine.getCurrentLevelInfo(activeUser);

    const unlockedIds = useMemo(() => 
        backendAchievements?.map(a => a.id) || [], 
    [backendAchievements]);

    const filteredBadges = useMemo(() => {
        return Object.values(ACHIEVEMENTS).filter(a => a.category === activeCategory);
    }, [activeCategory]);

    const getProgress = (achId) => {
        if (unlockedIds.includes(achId)) return 100;
        if (achId === 'puzzle_master') return Math.min(99, (activeUser?.totalPoints / 500) * 100);
        if (achId === 'streak_7') return Math.min(99, (activeUser?.streakCount / 7) * 100);
        return 0;
    };

    const handleTabChange = (tab) => {
        setSearchParams({ tab });
    };

    const handleLogout = async () => {
        localStorage.removeItem('token');
        dispatch(logout());
        navigate('/');
    };

    if (!isUserActive) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-4xl mx-auto text-center py-32 bg-surface/20 rounded-3xl border border-surface/50 backdrop-blur-md"
            >
                <div className="text-8xl mb-6">🔒</div>
                <h1 className="text-4xl font-black text-text-main mb-4 tracking-tighter italic dark:text-white">ACCESS_DENIED</h1>
                <p className="text-text-muted mb-10 max-w-sm mx-auto font-mono text-sm">Neural core requires initialization. Please establish identity link.</p>
                <button
                    onClick={() => navigate('/login')}
                    className="px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary/90 transition-all shadow-glow-primary active:scale-95"
                >
                    Establish Link
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto py-10 px-4 space-y-8"
        >
            {/* Header: Identity Card */}
            <div className="bg-surface/50 dark:bg-black/40 backdrop-blur-md rounded-[32px] p-8 shadow-2xl border border-surface/50 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 w-full relative overflow-hidden">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
                
                <div className="flex flex-col md:flex-row shadow-black/40 items-center gap-8 text-center md:text-left flex-1 relative z-10">
                    <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-primary via-accent to-primary rounded-full blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200 animate-spin-slow"></div>
                        {activeUser?.picture ? (
                            <img src={activeUser.picture} alt="Avatar" className="relative w-32 h-32 rounded-full border-[4px] border-surface dark:border-white/10 shadow-2xl group-hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                        ) : (
                            <div className="relative w-32 h-32 bg-bg-elevated dark:bg-zinc-900 rounded-full flex items-center justify-center text-primary text-5xl font-black shadow-2xl border-[4px] border-surface dark:border-white/10">
                                {activeUser?.name?.[0] || activeUser?.username?.[0] || 'L'}
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 transform scale-110">
                            <RankBadge rank={levelInfo} size="sm" />
                        </div>
                    </div>
                    
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                            <h2 className="text-4xl font-black text-text-main dark:text-white tracking-tight uppercase italic">
                                {activeUser?.name || activeUser?.username || 'OPERATIVE'}
                            </h2>
                            <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] text-primary font-black tracking-widest uppercase md:mt-1 w-fit mx-auto md:mx-0">
                                {levelInfo.name}
                            </span>
                        </div>
                        <p className="text-text-muted font-mono text-sm mb-6">
                            {isGuest ? 'GUEST_PROFILE (SYNC_ACTIVE)' : activeUser?.email}
                        </p>
                        
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black font-mono">
                                <span className="text-text-muted uppercase tracking-[0.2em]">Neural_Expansion_Progress</span>
                                <span className="text-primary">{levelInfo.progress}%</span>
                            </div>
                            <div className="w-full h-2 bg-black/40 rounded-full border border-white/5 overflow-hidden p-0.5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${levelInfo.progress}%` }}
                                    className="h-full bg-gradient-to-r from-primary to-accent rounded-full shadow-[0_0_12px_rgba(var(--primary-rgb),0.5)]"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 w-full md:w-auto relative z-10">
                    <StatCard icon={<Star size={20} />} value={<AnimatedScore value={activeUser?.totalPoints || activeUser?.score || 0} />} label="Total Points" color="text-primary" />
                    <StatCard icon={<Flame size={20} />} value={<AnimatedScore value={activeUser?.streakCount || activeUser?.streak || 0} />} label="Pulse Streak" color="text-accent" />
                </div>
            </div>

            {/* Toggle Switcher */}
            <div className="flex justify-center">
                <div className="bg-surface/50 dark:bg-black/60 p-1.5 rounded-[24px] border border-surface dark:border-white/5 flex gap-2 relative">
                    <button
                        onClick={() => handleTabChange('overview')}
                        className={`px-8 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all relative z-10 flex items-center gap-2 ${activeTab === 'overview' ? 'text-white' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Layout size={16} />
                        Overview
                    </button>
                    <button
                        onClick={() => handleTabChange('achievements')}
                        className={`px-8 py-3 rounded-[18px] text-xs font-black uppercase tracking-widest transition-all relative z-10 flex items-center gap-2 ${activeTab === 'achievements' ? 'text-white' : 'text-text-muted hover:text-text-main'}`}
                    >
                        <Trophy size={16} />
                        Achievements
                    </button>
                    <motion.div
                        layoutId="active-tab"
                        className="absolute inset-1.5 w-[calc(50%-6px)] bg-primary rounded-[18px] shadow-glow-primary"
                        animate={{ x: activeTab === 'overview' ? 0 : '100%' }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                </div>
            </div>

            {/* Content Area */}
            <AnimatePresence mode="wait">
                {activeTab === 'overview' ? (
                    <motion.div
                        key="overview"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-8"
                    >
                        <div className="bg-surface/30 dark:bg-black/40 backdrop-blur-sm rounded-[32px] p-8 shadow-2xl border border-surface dark:border-white/5">
                            <div className="flex justify-between items-center mb-8 px-2">
                                <h3 className="text-sm font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Zap className="text-primary" size={18} />
                                    Activity_Pulse_History
                                </h3>
                                <div className="text-[10px] font-black text-text-muted border border-white/10 px-3 py-1 rounded-full">
                                    {activity?.length || 0} OPERATIONAL_DAYS
                                </div>
                            </div>
                            <div className="overflow-x-auto pb-4 custom-scrollbar">
                                <Heatmap activity={activity || []} />
                            </div>
                        </div>

                        {/* Quick Badges Preview */}
                        <div className="bg-surface/30 dark:bg-black/40 backdrop-blur-sm rounded-[32px] p-8 shadow-2xl border border-surface dark:border-white/5">
                            <div className="flex justify-between items-center mb-8 px-2">
                                <h3 className="text-sm font-black text-text-muted uppercase tracking-[0.3em] flex items-center gap-3">
                                    <Award className="text-primary" size={18} />
                                    Elite_Decryption_Badges
                                </h3>
                                <button
                                    onClick={() => handleTabChange('achievements')}
                                    className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
                                >
                                    Expand View <ChevronRight size={14} />
                                </button>
                            </div>

                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-8">
                                {unlockedIds.slice(0, 8).map((id) => {
                                    const ach = Object.values(ACHIEVEMENTS).find(a => a.id === id);
                                    return (
                                        <motion.div 
                                            key={id}
                                            whileHover={{ y: -5 }}
                                            className="flex flex-col items-center gap-3 group"
                                        >
                                            <div className="w-16 h-16 flex items-center justify-center relative">
                                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                                <RibbonBadge 
                                                    type={ach?.rarity === 'Legendary' ? 'ruby' : ach?.rarity === 'Epic' ? 'gold' : 'silver'} 
                                                    shape="star" 
                                                    icon={Star} 
                                                    size={64} 
                                                    className="drop-shadow-lg relative z-10" 
                                                />
                                            </div>
                                            <span className="text-[9px] font-black text-center text-text-muted uppercase group-hover:text-primary transition-colors truncate w-full">{ach?.name || id}</span>
                                        </motion.div>
                                    );
                                })}
                                {unlockedIds.length === 0 && (
                                    <p className="col-span-full text-center text-text-muted font-mono text-xs py-12 border-2 border-dashed border-white/5 rounded-[24px]">
                                        NO_ACHIEVEMENTS_CORE_SYNCED.
                                    </p>
                                )}
                                {unlockedIds.length > 8 && (
                                    <button 
                                        onClick={() => handleTabChange('achievements')}
                                        className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-text-muted hover:text-primary transition-colors text-xs font-black"
                                    >
                                        +{unlockedIds.length - 8}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center pt-4">
                            <button
                                onClick={handleLogout}
                                className="px-10 py-4 bg-error/10 text-error hover:bg-error/20 transition-all rounded-[20px] font-black uppercase tracking-widest flex items-center gap-3 active:scale-95 border border-error/20"
                            >
                                <LogOut size={16} />
                                {isGuest ? 'Abandon Profile' : 'Terminate Session'}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="achievements"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-12"
                    >
                        {/* Achievement Progress Overview */}
                        <div className="bg-surface/30 dark:bg-black/40 backdrop-blur-sm rounded-[32px] p-8 md:p-12 border border-surface dark:border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
                            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                                <div className="text-center md:text-left">
                                    <h3 className="text-4xl font-black text-white italic tracking-widest uppercase mb-2">
                                        Achievement_<span className="text-primary">Sync</span>
                                    </h3>
                                    <p className="text-text-muted font-mono text-sm uppercase tracking-widest max-w-sm">
                                        Cognitive resonance at {Math.min(100, (unlockedIds.length / Object.keys(ACHIEVEMENTS).length) * 100).toFixed(1)}%. Logic core stabilized.
                                    </p>
                                </div>
                                <div className="relative w-40 h-40 flex items-center justify-center">
                                    <div className="absolute inset-0 bg-primary/20 blur-[30px] rounded-full animate-pulse" />
                                    <div className="relative z-10 text-center">
                                        <span className="block text-4xl font-black text-white leading-none">
                                            {Math.round((unlockedIds.length / Object.keys(ACHIEVEMENTS).length) * 100)}%
                                        </span>
                                        <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Mastery</span>
                                    </div>
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.05)" strokeWidth="6" fill="transparent" />
                                        <motion.circle
                                            cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="6" fill="transparent"
                                            strokeDasharray={2 * Math.PI * 70}
                                            initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                                            animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - (unlockedIds.length / Object.keys(ACHIEVEMENTS).length)) }}
                                            transition={{ duration: 1.5, ease: "easeOut" }}
                                            className="text-primary"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Category Selector */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-3 px-4">
                                <Award className="text-primary" size={24} />
                                <h2 className="text-xl font-black text-white tracking-widest uppercase italic">Decryption_Milestones</h2>
                            </div>
                            <div className="flex bg-surface/50 dark:bg-black/60 p-1 rounded-[20px] border border-white/5 w-fit mx-auto md:mx-0">
                                {CATEGORIES.map(category => (
                                    <button
                                        key={category}
                                        onClick={() => setActiveCategory(category)}
                                        className={`px-6 py-2 rounded-[16px] text-[10px] font-black uppercase tracking-widest transition-all relative ${activeCategory === category ? 'text-white' : 'text-text-muted hover:text-text-main'}`}
                                    >
                                        {activeCategory === category && (
                                            <motion.div layoutId="cat-pill" className="absolute inset-0 bg-primary/80 rounded-[16px] -z-10 shadow-glow-primary" />
                                        )}
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Badge Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            <AnimatePresence mode="popLayout">
                                {filteredBadges.map((badge, idx) => (
                                    <motion.div
                                        key={badge.id}
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                        transition={{ delay: idx * 0.05 }}
                                        onClick={() => unlockedIds.includes(badge.id) && (setSelectedBadge(badge), setIsModalOpen(true))}
                                        className={unlockedIds.includes(badge.id) ? "cursor-pointer" : ""}
                                    >
                                        <BadgeCard 
                                            achievement={badge} 
                                            isLocked={!unlockedIds.includes(badge.id)} 
                                            progress={getProgress(badge.id)}
                                            isMajor={badge.rarity === 'Legendary' || badge.rarity === 'Epic'}
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        <BadgeModal 
                            isOpen={isModalOpen} 
                            achievement={selectedBadge} 
                            onClose={() => setIsModalOpen(false)} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ProfileCenter;
