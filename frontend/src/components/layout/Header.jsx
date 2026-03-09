import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User, Moon, Sun, Gamepad2, Sparkles } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';

const Header = () => {
    const { isDark, toggleTheme } = useTheme();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleProfileClick = (e) => {
        e.preventDefault();
        if (isAuthenticated) {
            navigate('/profile');
        } else {
            navigate('/login');
        }
        setIsMenuOpen(false);
    };

    const navLinks = [
        { label: 'Landing', to: '/landing', icon: Sparkles },
        { label: 'Games', to: '/games', icon: Gamepad2 },
        { label: 'Leaderboard', to: '/leaderboard', icon: Activity }
    ];

    const handleNav = (to) => {
        navigate(to);
        setIsMenuOpen(false);
    };

    return (
        <header className="bg-brand-800 border-b border-brand-900 p-4 sticky top-0 z-10 shadow-lg text-white transition-colors duration-300">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3">
                    <img
                        src="/assets/logo.jpg"
                        alt="Logic Looper Logo"
                        className="h-14 w-auto object-contain rounded drop-shadow-sm"
                    />
                </Link>
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-white/70 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        title="Toggle Brightness"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <button
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        aria-label="Open menu"
                        className="flex flex-col gap-1.5 p-2"
                    >
                        <span className="block h-0.5 w-6 bg-white" />
                        <span className="block h-0.5 w-6 bg-white" />
                        <span className="block h-0.5 w-6 bg-white" />
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="fixed inset-0 z-40">
                    <div
                        className="absolute inset-0 bg-black/60"
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden
                    />
                    <nav className="relative z-10 mx-auto mt-16 w-[90vw] max-w-sm rounded-3xl bg-brand-900/95 border border-white/10 p-6 shadow-2xl backdrop-blur-xl space-y-4">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            return (
                                <button
                                    key={link.label}
                                    onClick={() => handleNav(link.to)}
                                    className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                                >
                                    <Icon size={20} />
                                    <span className="text-sm font-semibold tracking-wide">{link.label}</span>
                                </button>
                            );
                        })}
                        <button
                            onClick={handleProfileClick}
                            className="w-full flex items-center gap-4 px-3 py-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-left"
                        >
                            <User size={20} />
                            <span className="text-sm font-semibold tracking-wide">Profile / Login</span>
                        </button>
                    </nav>
                </div>
            )}

        </header>
    );
};

export default Header;
