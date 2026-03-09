import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Star, LogOut, ShieldCheck, Zap, Award, Flame as FlameIcon } from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

const StatCard = ({ icon, value, label, color }) => (
    <div className="bg-background rounded-xl p-4 text-center border border-surface shadow-sm">
        <div className={`text-3xl font-mono font-bold ${color} mb-1 flex items-center justify-center gap-2`}>
            {icon}
            {value}
        </div>
        <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">{label}</div>
    </div>
);

const ICON_MAP = {
    'award': <Award size={20} />,
    'shield-check': <ShieldCheck size={20} />,
    'flame': <FlameIcon size={20} />,
    'zap': <Zap size={20} />
};

const Profile = () => {
    const { user, isAuthenticated, isGuest } = useSelector((state) => state.auth);
    const achievements = useLiveQuery(() => db.achievements.toArray());
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/');
    };

    if (isGuest || !isAuthenticated) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto text-center py-20"
            >
                <div className="text-6xl mb-4">🎮</div>
                <h1 className="text-3xl font-bold text-text-main mb-4">Playing as Guest</h1>
                <p className="text-text-muted mb-8">Log in to save your streak and compete globally.</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                    Back to Game
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto py-10 px-4"
        >
            <div className="bg-surface rounded-2xl p-6 shadow-xl border border-surface/50 text-center mb-8">
                {user?.picture ? (
                    <img src={user.picture} alt="Avatar" className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary/20" referrerPolicy="no-referrer" />
                ) : (
                    <div className="w-24 h-24 bg-gradient-to-tr from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                        {user?.name?.[0] || 'U'}
                    </div>
                )}
                <h2 className="text-2xl font-bold text-text-main">{user?.name}</h2>
                <p className="text-text-muted mb-6 text-sm">{user?.email}</p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                    <StatCard icon={<Star size={16} />} value={user?.totalPoints || 0} label="Total Stars" color="text-primary" />
                    <StatCard icon={<Flame size={16} />} value={user?.streakCount || 0} label="Max Streak" color="text-accent" />
                </div>
            </div>

            {/* Achievements Section */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-brand-100">
                <h3 className="text-lg font-bold text-brand-900 mb-4 flex items-center gap-2">
                    <Award className="text-primary" />
                    Achievements
                </h3>
                <div className="grid grid-cols-4 gap-4">
                    {achievements?.map(ach => (
                        <div key={ach.id} className="flex flex-col items-center gap-2 group">
                            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                {ICON_MAP[ach.icon] || <Star size={20} />}
                            </div>
                            <span className="text-[10px] font-bold text-center text-text-muted leading-tight">{ach.name}</span>
                        </div>
                    ))}
                    {(!achievements || achievements.length === 0) && (
                        <p className="col-span-4 text-center text-text-muted text-xs py-4">Keep playing to unlock badges!</p>
                    )}
                </div>
            </div>

            <button
                onClick={handleLogout}
                className="w-full mt-8 py-3 bg-error/5 text-error hover:bg-error/10 transition-colors rounded-xl font-semibold flex items-center justify-center gap-2"
            >
                <LogOut size={16} />
                Sign Out
            </button>
        </motion.div>
    );
};

export default Profile;
