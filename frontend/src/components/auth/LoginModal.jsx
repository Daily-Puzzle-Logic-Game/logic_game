import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { X, Smartphone, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../../store/slices/authSlice';
import { db } from '../../db/db';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Returns true on Android mobile browsers where Truecaller 1-tap works.
const isAndroidMobile = () =>
    typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);

// Builds the truecallersdk:// deep link required by the Truecaller Web SDK.
const buildTruecallerDeepLink = (nonce) => {
    const partnerKey = import.meta.env.VITE_TRUECALLER_PARTNER_KEY || '';
    const partnerName = encodeURIComponent(import.meta.env.VITE_TRUECALLER_APP_NAME || 'Logic Looper');
    const callbackUrl = encodeURIComponent(`${API_URL}/api/auth/truecaller/callback`);
    const privacyUrl = encodeURIComponent(import.meta.env.VITE_TRUECALLER_PRIVACY_URL || `${window.location.origin}/privacy`);
    const termsUrl = encodeURIComponent(import.meta.env.VITE_TRUECALLER_TERMS_URL || `${window.location.origin}/terms`);

    return (
        `truecallersdk://truesdk/web_verify` +
        `?requestNonce=${nonce}` +
        `&partnerKey=${partnerKey}` +
        `&partnerName=${partnerName}` +
        `&partnerCallbackUrl=${callbackUrl}` +
        `&lang=en` +
        `&privacyUrl=${privacyUrl}` +
        `&termsUrl=${termsUrl}` +
        `&loginPrefix=use` +
        `&loginSuffix=continue` +
        `&ctaPrefix=use` +
        `&ctaColor=%230052CC` +
        `&ctaTextColor=%23ffffff` +
        `&btnShape=round` +
        `&skipOption=use_another_number`
    );
};

const TC_POLL_INTERVAL_MS = 2000;
const TC_MAX_POLLS = 30; // ~60 seconds
const TC_INITIAL_POLL_DELAY_MS = 3000; // Allow time for Truecaller app to launch

// Fallback UUID generator for environments without crypto.randomUUID().
const generateNonce = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
};

const LoginModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [tcStatus, setTcStatus] = useState('idle'); // 'idle' | 'waiting' | 'verifying'

    const pollTimerRef = useRef(null);
    const pollCountRef = useRef(0);
    const currentNonceRef = useRef(null);

    // Clean up polling when the modal closes or component unmounts.
    useEffect(() => {
        if (!isOpen) {
            stopPolling();
            setTcStatus('idle');
            setError(null);
        }
        return () => stopPolling();
    }, [isOpen]);

    const stopPolling = () => {
        if (pollTimerRef.current) {
            clearTimeout(pollTimerRef.current);
            pollTimerRef.current = null;
        }
        pollCountRef.current = 0;
    };

    const pollForSession = async (nonce) => {
        if (pollCountRef.current >= TC_MAX_POLLS) {
            stopPolling();
            setTcStatus('idle');
            setIsLoading(false);
            setError('Truecaller authentication timed out. Please try again.');
            return;
        }

        pollCountRef.current += 1;

        try {
            const response = await axios.get(`${API_URL}/api/auth/truecaller/session/${nonce}`);
            if (response.data.status === 'complete') {
                stopPolling();
                setTcStatus('verifying');
                const { user, token } = response.data;
                dispatch(loginSuccess({ user, token }));
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                setIsLoading(false);
                onClose();
            } else {
                scheduleNextPoll(nonce);
            }
        } catch (err) {
            if (err.response?.status === 404) {
                // Session not ready yet — keep polling.
                scheduleNextPoll(nonce);
            } else {
                stopPolling();
                setTcStatus('idle');
                setIsLoading(false);
                setError('Authentication check failed. Please try again.');
            }
        }
    };

    const scheduleNextPoll = (nonce) => {
        pollTimerRef.current = setTimeout(() => pollForSession(nonce), TC_POLL_INTERVAL_MS);
    };

    const handleTruecallerClick = () => {
        setError(null);

        if (!isAndroidMobile()) {
            setError(
                'Truecaller 1-tap is only available on Android mobile browsers with the Truecaller app installed. Please use Google Sign-In on this device.'
            );
            return;
        }

        const nonce = generateNonce();
        currentNonceRef.current = nonce;
        pollCountRef.current = 0;

        const deepLink = buildTruecallerDeepLink(nonce);

        setIsLoading(true);
        setTcStatus('waiting');

        // Attempt to open the Truecaller app via the deep link.
        window.location.href = deepLink;

        // Start polling after a short delay to allow the Truecaller app to open.
        pollTimerRef.current = setTimeout(() => pollForSession(nonce), TC_INITIAL_POLL_DELAY_MS);
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError(null);
        try {
            const localUser = await db.user.get('local_user');
            const localStreakCount = localUser?.streakCount ?? 0;
            const localLastPlayed = localUser?.lastPlayed ?? null;

            const response = await axios.post(
                `${API_URL}/api/auth/google`,
                {
                    token: credentialResponse.credential,
                    localData: { streakCount: localStreakCount, lastPlayed: localLastPlayed }
                }
            );

            const { user, token } = response.data;
            dispatch(loginSuccess({ user, token }));
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

    const tcButtonLabel =
        tcStatus === 'waiting' ? 'Waiting for Truecaller…' :
        tcStatus === 'verifying' ? 'Verifying…' :
        'Continue with Truecaller';

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
                            <div className="bg-error/10 border border-error/20 text-error rounded-lg p-3 text-sm flex items-start gap-2 text-left">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-4 pt-2">
                            {/* Google Login */}
                            <div className="flex justify-center w-full [&>div]:w-full">
                                {isLoading ? (
                                    <div className="h-10 flex items-center justify-center text-text-muted gap-2">
                                        <Loader2 size={16} className="animate-spin" />
                                        Authenticating…
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

                            {/* Truecaller Login */}
                            <button
                                className="w-full h-10 bg-[#0052CC] hover:bg-[#0041A3] text-white rounded-full flex items-center justify-center gap-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                                onClick={handleTruecallerClick}
                            >
                                {tcStatus === 'waiting' || tcStatus === 'verifying' ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Smartphone size={18} />
                                )}
                                {tcButtonLabel}
                            </button>

                            {!isAndroidMobile() && (
                                <p className="text-xs text-text-muted">
                                    Truecaller 1-tap requires Android + Truecaller app.
                                </p>
                            )}
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
