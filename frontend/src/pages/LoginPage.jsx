import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { ArrowLeft, Mail, Lock, User as UserIcon } from 'lucide-react';
import api, { getApiUrl } from '../config/api';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, guestLogin } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { getOrSetGuestId } from '../utils/cookie';

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

    // Pre-fill profile name if already logged in as guest
    const { user: authUser, isGuest } = useSelector(state => state.auth);
    useEffect(() => {
        if (isGuest && authUser?.name && !formData.name) {
            setFormData(prev => ({ ...prev, name: authUser.name }));
        }
    }, [isGuest, authUser]);

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
            
            const response = await api.post(endpoint, formData);

            const { user, token } = response.data;
            dispatch(loginSuccess({ user, token }));

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            navigate('/');
        } catch (err) {
            console.error('Auth Error:', err);
            setError(`Cloud Sync Logic Interrupted. Ensure backend is active at ${getApiUrl('')}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestToggle = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const guestId = getOrSetGuestId();
            // Try silent login first
            const response = await api.post('/api/auth/guest', {
                guestId
            });

            const { user, token } = response.data;
            
            // If user already has a custom name (not 'Operative XXXX'), log them in immediately
            const isDefaultName = user.name && user.name.startsWith('Operative ');
            
            if (!isDefaultName) {
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                dispatch(guestLogin({ user, token }));
                navigate('/');
            } else {
                // Otherwise, show the name input mode
                setMode('guest');
                if (user.name) setFormData(prev => ({ ...prev, name: user.name }));
            }
        } catch (err) {
            console.error('Guest Check Error:', err);
            setMode('guest'); // Fallback to manual guest mode
        } finally {
            setIsLoading(false);
        }
    };

    const handleGuestSubmit = async (e) => {
        e.preventDefault();
        const nameToUse = formData.name || 'GUEST_OPERATIVE';
        
        setIsLoading(true);
        setError(null);
        try {
            const guestId = getOrSetGuestId();
            const response = await api.post('/api/auth/guest', {
                guestId,
                name: nameToUse
            });

            const { user, token } = response.data;
            
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            dispatch(guestLogin({ user, token }));
            navigate('/');

        } catch (err) {
            console.error('Guest Error:', err);
            setError('Failed to initiate guest session.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.post('/api/auth/google',
                { token: credentialResponse.credential }
            );

            const { user, token } = response.data;
            dispatch(loginSuccess({ user, token }));

            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            navigate('/');
        } catch (err) {
            console.error('Google Auth Error:', err);
            const msg = err.response?.status === 403 
                ? 'Authorized Origin Error: Ensure this URL is added to your Google Cloud Console.' 
                : (err.response?.data?.message || 'Authentication failed. Please try again.');
            setError(msg);
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
                        {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create an Account' : 'Guest Operative'}
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-text-muted text-center text-sm"
                    >
                        {mode === 'login' ? 'Login to continue your logic journey.' : mode === 'signup' ? 'Sign up to start saving your cloud progress.' : 'Enter a name to play instantly.'}
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
                    <form onSubmit={mode === 'guest' ? handleGuestSubmit : handleEmailSubmit} className="space-y-4">
                        <AnimatePresence mode="wait">
                            {mode !== 'login' && (
                                <motion.div
                                    key="name-input"
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
                                        placeholder={mode === 'guest' ? "Guest Name" : "Full Name"}
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-background border border-surface text-text-main rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-text-muted/50"
                                    />
                                </motion.div>
                            )}

                            {mode !== 'guest' && (
                                <motion.div
                                    key="auth-inputs"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="space-y-4"
                                >
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
                                            required={mode !== 'guest'}
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
                                            required={mode !== 'guest'}
                                            minLength={6}
                                            className="w-full bg-background border border-surface text-text-main rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium placeholder:text-text-muted/50"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl py-3 font-semibold transition-all hover:scale-[1.02] shadow-lg shadow-primary/20 disabled:opacity-50"
                        >
                            {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Continue as Guest')}
                        </button>
                    </form>

                    <div className="text-center mt-4 flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                            className="text-sm text-text-muted hover:text-primary transition-colors font-medium"
                        >
                            {mode === 'login' ? "Don't have an account? Sign up" : "Already have an account? Log in"}
                        </button>
                        
                        {mode !== 'guest' && (
                            <button
                                type="button"
                                onClick={handleGuestToggle}
                                className="text-xs text-primary/70 hover:text-primary transition-colors font-bold uppercase tracking-widest p-2"
                            >
                                Continue as Guest
                            </button>
                        )}
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
                                onError={() => setError('Google Login Failed: Verify your Client ID and Authorized Origins.')}
                                theme="filled_blue"
                                shape="pill"
                                width="340"
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
