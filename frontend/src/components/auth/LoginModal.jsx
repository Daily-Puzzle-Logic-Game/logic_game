import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { X, Smartphone, Gamepad2 } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
const LoginModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/auth/google`,
                {
                    token: credentialResponse.credential,
                    localData: { streakCount: 0, lastPlayed: null }
                }
            );

            const { user, token } = response.data;
            dispatch(loginSuccess({ user, token }));

            // Set token for future Axios requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            onClose();
        } catch (err) {
            console.error('Google Auth Error:', err);
            setError(err.response?.data?.message || 'Authentication failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-surface rounded-2xl border border-surface/50 shadow-2xl overflow-hidden w-full max-w-sm relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-text-muted hover:text-text-main transition-colors"
                        disabled={isLoading}
                    >
                        <X size={24} />
                    </button>

                    <div className="p-8 text-center space-y-6">
                        <div className="flex justify-center">
                            <img
                                src="/assets/logo.jpg"
                                alt="Logo"
                                className="h-16 w-auto object-contain rounded-xl shadow-lg border-2 border-primary/20"
                            />
                        </div>

                        <div>
                            <h2 className="text-2xl font-bold text-text-main mb-2">Welcome Back</h2>
                            <p className="text-text-muted text-sm">
                                Save your streak and compete globally.
                            </p>
                        </div>

                        {error && (
                            <div className="bg-error/10 border border-error/20 text-error rounded-lg p-3 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4 pt-2">
                            {/* Google Login Wrapper */}
                            <div className="flex justify-center w-full [&>div]:w-full">
                                {isLoading ? (
                                    <div className="h-10 flex items-center justify-center text-text-muted">
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

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-surface/50"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-surface px-2 text-text-muted">Or</span>
                                </div>
                            </div>

                            {/* Truecaller Placeholder */}
                            <button
                                className="w-full h-10 bg-[#0052CC] hover:bg-[#0041A3] text-white rounded-full flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50"
                                disabled={isLoading}
                                onClick={() => setError('Truecaller testing requires a valid domain callback. Deployment pending.')}
                            >
                                <Smartphone size={18} />
                                Continue with Truecaller
                            </button>
                        </div>

                        <p className="text-xs text-text-muted pt-4">
                            By continuing, you agree to our Terms of Service.
                        </p>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default LoginModal;
