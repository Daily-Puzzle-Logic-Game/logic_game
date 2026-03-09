import sys
content = '''import { useState } from 'react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { Smartphone, ArrowLeft } from 'lucide-react';
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

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError(null);
        try {
            const localUser = await db.user.get('local_user');
            const localStreakCount = localUser?.streakCount ?? 0;
            const localLastPlayed = localUser?.lastPlayed ?? null;

            const response = await axios.post(
                ${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google,
                {
                    token: credentialResponse.credential,
                    localData: { streakCount: localStreakCount, lastPlayed: localLastPlayed }
                }
            );

            const { user, token } = response.data;
            dispatch(loginSuccess({ user, token }));

            axios.defaults.headers.common['Authorization'] = Bearer ;
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

            <div className="bg-surface/80 backdrop-blur-xl rounded-[2.5rem] border border-surface shadow-2xl p-10 w-full max-w-md">
                <div className="flex flex-col items-center mb-10">
                    <motion.img
                        initial={{ scale: 0.8, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, type: 'spring', damping: 15 }}
                        src="/assets/logo.jpg"
                        alt="Bluestock Logo"
                        className="h-12 md:h-16 w-auto object-contain mb-8 hover:scale-105 transition-transform"
                    />
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold text-text-main text-center mb-3"
                    >
                        Unlock Your Logic
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-text-muted text-center"
                    >
                        Save your daily streak securely to the cloud and compete globally.
                    </motion.p>
                </div>

                {error && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-error/10 border border-error/20 text-error rounded-xl p-4 text-sm mb-6 text-center"
                    >
                        {error}
                    </motion.div>
                )}

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-5"
                >
                    <div className="flex justify-center w-full [&>div]:w-full transition-transform hover:scale-[1.02]">
                        {isLoading ? (
                            <div className="h-12 w-full flex items-center justify-center text-text-muted bg-background rounded-full animate-pulse">
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

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-surface/80"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                            <span className="bg-surface px-4 text-text-muted/60">Or</span>
                        </div>
                    </div>

                    <button
                        className="w-full h-12 bg-[#0052CC] hover:bg-[#0041A3] text-white rounded-full flex items-center justify-center gap-3 font-medium transition-all hover:scale-[1.02] shadow-lg shadow-blue-500/20 disabled:opacity-50"
                        disabled={isLoading}
                        onClick={() => setError('Truecaller testing requires a valid domain callback.')}
                    >
                        <Smartphone size={20} />
                        Continue with Truecaller
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default LoginPage;
'''
with open('src/pages/LoginPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Done!')
