import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, Sun, Moon, CheckCircle2, AlertCircle, Info, Trophy } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../hooks/useTheme';
import { fetchNotifications, markNotificationAsRead, markAllAsRead, clearNotifications } from '../../store/slices/notificationSlice';
import { motion, AnimatePresence } from 'framer-motion';

const Header = () => {
    const { isDark, toggleTheme } = useTheme();
    const { isAuthenticated, isGuest, user } = useSelector((state) => state.auth);
    const { items: notifications, unreadCount } = useSelector((state) => state.notifications);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const notifRef = useRef(null);

    useEffect(() => {
        if (isAuthenticated) {
            dispatch(fetchNotifications());
            const interval = setInterval(() => {
                dispatch(fetchNotifications());
            }, 30000); // Polling every 30s
            return () => clearInterval(interval);
        }
    }, [isAuthenticated, dispatch]);

    // Close notification dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setIsNotifOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (isAuthenticated || isGuest) {
            dispatch(logout());
            navigate('/');
        } else {
            navigate('/login');
        }
        setIsMenuOpen(false);
    };

    const handleMarkAllRead = () => {
        dispatch(markAllAsRead());
    };

    const handleClearAll = () => {
        if (window.confirm('Clear all notifications?')) {
            dispatch(clearNotifications());
        }
    };

    const handleNotifClick = (n) => {
        if (!n.read) {
            dispatch(markNotificationAsRead(n.id));
        }
        setIsNotifOpen(false);

        if (n.type === 'ACHIEVEMENT') {
            navigate('/achievements');
        }
    };

    const navLinks = [
        { label: 'Journey', to: '/journey' },
        { label: 'Library', to: '/games' },
        { label: 'Leaderboard', to: '/leaderboard' },
        { label: 'Achievements', to: '/achievements' }
    ];

    const getIcon = (type) => {
        switch (type) {
            case 'ACHIEVEMENT': return <Trophy size={14} className="text-yellow-500" />;
            case 'SYSTEM': return <AlertCircle size={14} className="text-blue-500" />;
            default: return <Info size={14} className="text-slate-400" />;
        }
    };

    return (
        <header className="bg-black/40 backdrop-blur-xl border-b border-white/5 py-4 px-4 md:px-8 w-full z-50 sticky top-0 transition-colors duration-300">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2">
                    <img
                        src="/assets/logo.jpg"
                        alt="Logo"
                        className="h-8 w-auto object-contain dark:invert"
                    />
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden lg:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.label}
                            to={link.to}
                            className="text-[13px] font-black text-slate-800 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors uppercase tracking-widest"
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Right Actions */}
                <div className="flex items-center gap-4">

                    <div className="relative" ref={notifRef}>
                        <button
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                            className="p-2 text-slate-700 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-900 rounded-xl transition-colors relative"
                        >
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-600 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-[#050507]">
                                    {unreadCount}
                                </span>
                            )}
                        </button>

                        <AnimatePresence>
                            {isNotifOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2"
                                >
                                    <div className="px-4 py-2 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-500">Notifications</span>
                                            {unreadCount > 0 && (
                                                <button 
                                                    onClick={handleMarkAllRead}
                                                    className="text-[8px] font-bold text-blue-500 hover:underline uppercase text-left pt-0.5"
                                                >
                                                    Mark All Read
                                                </button>
                                            )}
                                        </div>
                                        {unreadCount > 0 && <span className="text-[9px] font-bold text-blue-500">{unreadCount} New</span>}
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {notifications.length === 0 ? (
                                            <div className="p-8 text-center">
                                                <Bell className="mx-auto mb-2 text-slate-300 dark:text-zinc-800" size={24} />
                                                <p className="text-[11px] text-slate-400 dark:text-zinc-600 font-mono italic">No new signals</p>
                                            </div>
                                        ) : (
                                            notifications.map((n) => (
                                                <div
                                                    key={n.id}
                                                    onClick={() => handleNotifClick(n)}
                                                    className={`p-4 border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer relative group ${!n.read ? 'bg-blue-50/30 dark:bg-blue-600/5' : ''}`}
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="mt-1 shrink-0">
                                                            {n.type === 'ACHIEVEMENT' ? <Trophy size={14} className="text-yellow-500" /> : <Info size={14} className="text-blue-500" />}
                                                        </div>
                                                        <div className="space-y-1">
                                                            <h4 className={`text-[11px] font-bold uppercase tracking-tight ${!n.read ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-zinc-500'}`}>{n.title}</h4>
                                                            <p className="text-[11px] text-slate-500 dark:text-zinc-500 leading-tight font-light">{n.message}</p>
                                                            <p className="text-[9px] font-mono text-slate-400 dark:text-zinc-600 uppercase pt-1 italic">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                    {!n.read && (
                                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <CheckCircle2 size={14} className="text-blue-500" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {notifications.length > 0 && (
                                        <div className="p-3 text-center border-t border-slate-100 dark:border-white/5">
                                            <button 
                                                onClick={handleClearAll}
                                                className="text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-zinc-600 hover:text-red-500 transition-colors"
                                            >
                                                Clear All
                                            </button>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleAuthAction}
                        className="hidden sm:block bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-xl font-bold text-[11px] tracking-widest uppercase transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                    >
                        { (isAuthenticated || isGuest) ? 'Logout' : 'Access Terminal' }
                    </button>

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        className="lg:hidden flex flex-col gap-[4px] p-2 text-gray-600 dark:text-gray-300"
                    >
                        <span className="block h-[2px] w-5 bg-current" />
                        <span className="block h-[2px] w-5 bg-current" />
                        <span className="block h-[2px] w-5 bg-current" />
                    </button>
                </div>
            </div>

            {/* Mobile Navigation Dropdown */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="absolute top-full left-0 w-full bg-white dark:bg-[#050507] border-b border-gray-100 dark:border-white/5 shadow-lg lg:hidden py-4 overflow-hidden"
                    >
                        <nav className="flex flex-col px-4 gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    to={link.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-900 text-[13px] font-black text-slate-800 dark:text-zinc-400 uppercase tracking-widest"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            <button
                                onClick={handleAuthAction}
                                className="bg-blue-600 text-white py-4 rounded-xl font-black w-full mt-4 hover:bg-blue-500 transition-colors uppercase text-[11px] tracking-widest"
                            >
                                { (isAuthenticated || isGuest) ? 'Logout' : 'Access Terminal' }
                            </button>
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};

export default Header;
