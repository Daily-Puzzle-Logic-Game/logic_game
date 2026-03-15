import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import PuzzleContainer from '../components/puzzle/PuzzleContainer';
import { useSelector } from 'react-redux';

const PracticeGame = ({ triggerSync = null }) => {
    const { type } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto p-4 md:p-8"
        >
            <button
                onClick={() => navigate('/games')}
                className="flex items-center gap-2 text-text-muted hover:text-primary transition-colors mb-6 font-semibold"
            >
                <ChevronLeft size={20} />
                Back to Library
            </button>

            <PuzzleContainer
                user={user}
                practiceMode={true}
                practiceType={type}
                triggerSync={triggerSync}
            />
        </motion.div>
    );
};

export default PracticeGame;
