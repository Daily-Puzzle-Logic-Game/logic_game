import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Share2 } from 'lucide-react';
import PuzzleContainer from '../components/puzzle/PuzzleContainer';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';

const ChallengePage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    
    // Example format: /challenge?type=MemoryGrid&seed=12345
    const type = searchParams.get('type') || 'MemoryGrid';
    const seed = searchParams.get('seed') || 'daily';
    const challenger = searchParams.get('by') || 'a friend';

    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto p-4 md:p-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors font-semibold w-max"
                 >
                    <ChevronLeft size={20} />
                    Back Hub
                 </button>

                 <div className="flex items-center gap-3">
                     <span className="text-sm font-medium text-text bg-bg-elevated px-4 py-2 rounded-full border border-border">
                         Challenged by: <span className="text-secondary">{challenger}</span>
                     </span>

                     <button
                        onClick={handleShare}
                        className="flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-xl font-bold hover:bg-primary/30 transition shadow-glow-primary text-sm"
                     >
                        <Share2 size={16} />
                        {copied ? 'Copied Link!' : 'Share Challenge'}
                     </button>
                 </div>
            </div>

            <div className="bg-bg-elevated/40 border border-border rounded-2xl p-6  mb-6 shadow-xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 p-8 opacity-10 blur-2xl pointer-events-none">
                    <div className="w-32 h-32 bg-secondary rounded-full" />
                </div>
                
                <h2 className="text-xl font-black text-text mb-2 relative z-10 font-heading tracking-tight">
                    Accepting The Gauntlet
                </h2>
                <p className="text-text-muted mb-6 relative z-10 text-sm">
                    You are playing a custom seed exactly as generated for <span className="text-secondary font-bold">{challenger}</span>. Can you beat their time?
                </p>

                <PuzzleContainer
                    user={user}
                    practiceMode={true}
                    practiceType={type}
                    challengeSeed={seed}
                />
            </div>
        </motion.div>
    );
};

export default ChallengePage;
