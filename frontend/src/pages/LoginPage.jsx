import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { Smartphone, ArrowLeft, Mail, Lock, User as UserIcon } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import { db } from '../db/db';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [mode, setMode] = useState('login'); // 'login' or 'signup'
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const localUser = await db.user.get('local_user');
            const localStreakCount = localUser?.streakCount ?? 0;
            const localLastPlayed = localUser?.lastPlayed ?? null;

            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
            
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}${endpoint}`,
                {
                    ...formData,
                    localData: { streakCount: localStreakCount, lastPlayed: localLastPlayed }
                }
            );

            const { user, token } = response.data;
            dispatch(loginSuccess({ user, token }));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            navigate('/profile');
        } catch (err) {
            console.error('Auth Error:', err);
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError(null);
        try {
            const localUser = await db.user.get('local_user');
            const localStreakCount = localUser?.streakCount ?? 0;
            const localLastPlayed = localUser?.lastPlayed ?? null;

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`,
                {
                    token: credentialResponse.credential,
                    localData: { streakCount: localStreakCount, lastPlayed: localLastPlayed }
                }
            );

            const { user, token } = response.data;
            dispatch(loginSuccess({ user, token }));

            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            navigate('/profile');
        } catch (err) {
            console.error('Google Auth Error:', err);
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-[80vh] flex flex-col items-center justify-center p-4 relative"
        >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] -z-10 pointer-events-none" />

            <button
                onClick={() => navigate(-1)}
                className="absolute top-0 left-0 flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-6 font-semibold"
            >
                <ArrowLeft size={20} />
                Back
            </button>

            <div className="bg-surface/80 backdrop-blur-xl rounded-[2.5rem] border border-surface shadow-2xl p-8 w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <motion.img
                        initial={{ scale: 0.8, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                        src="/assets/logo.jpg"
                        alt="Bluestock Logo"
                        className="h-12 md:h-16 w-auto object-contain mb-6 hover:scale-105 transition-transform"
                    />
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-2xl font-bold text-text-main text-center mb-2"
                    >
                        {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-text-muted text-center text-sm"
                    >
                        {mode === 'login' ? 'Login to continue your logic journey.' : 'Sign up to start saving your progress.'}
                    </motion.p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-error/10 border border-error/20 text-error rounded-xl p-3 text-sm mb-6 text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-6"
                >
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <AnimatePresence>
                            {mode === 'signup' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="relative"
                                >
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <UserIcon className="text-text-muted/60" size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="Full Name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required={mode === 'signup'}
                                        className="w-full bg-background border border-surface text-text-main rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-text-muted/50"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Mail className="text-text-muted/60" size={18} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full bg-background border border-surface text-text-main rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-text-muted/50"
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Lock className="text-text-muted/60" size={18} />
                            </div>
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                                className="w-full bg-background border border-surface text-text-main rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-text-muted/50"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-3 font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Sign Up')}
                        </button>
                    </form>

                    <div className="text-center mt-4">
                        <button
                            type="button"
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="text-sm text-text-muted hover:text-primary transition-colors font-medium"
                        >
                            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                        </button>
                    </div>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-surface/80"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                            <span className="bg-surface px-4 text-text-muted/60">Or</span>
                        </div>
                    </div>

                    <div className="flex justify-center w-full [&>div]:w-full transition-transform hover:scale-[1.02]">
                        {isLoading ? (
                            <div className="h-11 w-full flex items-center justify-center text-text-muted bg-background rounded-full animate-pulse">
                                Authenticating...
                            </div>
                        ) : (
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={() => setError('Google Login Failed')}
                                useOneTap
                                theme="filled_blue"
                                shape="pill"
                                width="100%"
                                text="continue_with"
                            />
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LoginPage;
