import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, User, Moon, Sun, Gamepad2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useTheme } from '../../hooks/useTheme';
import LoginModal from '../auth/LoginModal';

const Header = () => {
    const { isDark, toggleTheme } = useTheme();
    const { isAuthenticated } = useSelector((state) => state.auth);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const navigate = useNavigate();

    const handleProfileClick = (e) => {
        e.preventDefault();
        if (isAuthenticated) {
            navigate('/profile');
        } else {
            setIsLoginModalOpen(true);
        }
    };

    return (
        <header className="bg-surface border-b border-surface p-4 sticky top-0 z-10 shadow-sm transition-colors duration-300">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-3">
                    <img
                        src="/assets/logo.jpg"
                        alt="Logic Looper Logo"
                        className="h-14 w-auto object-contain rounded drop-shadow-sm"
                    />
                </Link>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={toggleTheme}
                        className="p-2 text-text-muted hover:text-accent transition-colors rounded-full hover:bg-background"
                        title="Toggle Brightness"
                    >
                        {isDark ? <Sun size={20} /> : <Moon size={20} />}
                    </button>
                    <Link to="/games" className="p-2 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-background" title="Games Library">
                        <Gamepad2 size={20} />
                    </Link>
                    <Link to="/leaderboard" className="p-2 text-text-muted hover:text-primary transition-colors rounded-full hover:bg-background" title="Leaderboard">
                        <Activity size={20} />
                    </Link>
                    <button
                        onClick={handleProfileClick}
                        className="p-2 text-text-muted hover:text-secondary transition-colors rounded-full hover:bg-background"
                        title="Profile / Login"
                    >
                        <User size={20} />
                    </button>
                </div>
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </header>
    );
};

export default Header;
