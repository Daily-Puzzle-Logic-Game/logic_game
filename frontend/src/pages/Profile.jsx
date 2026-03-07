import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Star, LogOut } from 'lucide-react';
import { logout } from '../store/slices/authSlice';

const StatCard = ({ icon, value, label, color }) => (
    <div className="bg-background rounded-xl p-4 text-center">
        <div className={`text-3xl font-mono font-bold ${color} mb-1`}>{value}</div>
        <div className="text-xs text-text-muted uppercase tracking-wider font-semibold">{label}</div>
    </div>
);

const Profile = () => {
    const { user, isAuthenticated, isGuest } = useSelector((state) => state.auth);
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

    // Read streakCount from the auth user object returned by backend on login
    const streakCount = user?.streakCount ?? 0;
    const totalPoints = user?.totalPoints ?? 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto py-10 px-4"
        >
            <div className="bg-surface rounded-2xl p-6 shadow-xl border border-surface/50 text-center">
                {user?.picture ? (
                    <img
                        src={user.picture}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-primary/20"
                        referrerPolicy="no-referrer"
                    />
                ) : (
                    <div className="w-24 h-24 bg-gradient-to-tr from-primary to-accent rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                        {user?.name?.[0] || 'U'}
                    </div>
                )}

                <h2 className="text-2xl font-bold text-text-main">{user?.name}</h2>
                <p className="text-text-muted mb-6 text-sm">{user?.email}</p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <StatCard
                        icon={<Star size={16} />}
                        value={totalPoints}
                        label="Total Stars"
                        color="text-primary"
                    />
                    <StatCard
                        icon={<Flame size={16} />}
                        value={streakCount}
                        label="Max Streak 🔥"
                        color="text-accent"
                    />
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full py-3 bg-error/10 text-error hover:bg-error/20 transition-colors rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                    <LogOut size={16} />
                    Sign Out
                </button>
            </div>
        </motion.div>
    );
};

export default Profile;
