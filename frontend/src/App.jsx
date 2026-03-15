import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import MainLayout from './components/layout/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Puzzle, Zap } from 'lucide-react';
import { useGameEngine } from './hooks/useGameEngine';
import { formatTime } from './utils/time';
import PuzzleContainer from './components/puzzle/PuzzleContainer';
import ProfileCenter from './pages/ProfileCenter';
import GamesLibrary from './pages/GamesLibrary';
import PracticeGame from './pages/PracticeGame';
import ChallengePage from './pages/ChallengePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Leaderboard from './pages/Leaderboard';
import HintlessHeroChallenge from './pages/HintlessHeroChallenge';
import PuzzleMasterChallenge from './pages/PuzzleMasterChallenge';
import StreakKeeperChallenge from './pages/StreakKeeperChallenge';
import DailyRewardModal from './components/rewards/DailyRewardModal';
import StreakShieldPopup from './components/rewards/StreakShieldPopup';
// Achievements.jsx removed
import AchievementToast from './components/ui/AchievementToast';
import AchievementCelebration from './components/rewards/AchievementCelebration';
import AmbientBackground from './components/ui/AmbientBackground';
import { clearLastUnlocked } from './store/slices/achievementSlice';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';


import JourneyMap from './pages/JourneyMap';
import JourneyGame from './pages/JourneyGame';

function App() {
  const dispatch = useDispatch();
  const { isInitializing, user, secondsToMidnight } = useGameEngine();
  const currentPuzzle = useSelector((state) => state.game.currentPuzzle);
  const lastUnlocked = useSelector((state) => state.achievements.lastUnlocked);
  
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [showStreakShield, setShowStreakShield] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (lastUnlocked) {
      // Show full celebration for ANY achievement unlock for the "wow" factor with anime girl
      setShowCelebration(true);
      setShowToast(false);
    }
  }, [lastUnlocked]);
  const location = useLocation();

  useEffect(() => {

    if (!isInitializing && user) {
      // 1. Check Daily Reward
      const lastClaim = localStorage.getItem('lastRewardClaim');
      const todayStr = new Date().toISOString().split('T')[0];
      if (lastClaim !== todayStr) {
        setTimeout(() => setShowDailyReward(true), 1000);
      }

      // 2. Check Streak Shield (If user has shields and streak is at risk)
      // For now, let's assume simple shield check if streak is broken
      // This logic will be fleshed out as we implement streak shield persistence
      const streakBroken = localStorage.getItem('streak_at_risk') === 'true';
      if (streakBroken) {
        setShowStreakShield(true);
      }
    }
  }, [isInitializing, user]);

  return (
    <MainLayout>
      <AmbientBackground />
      <AnimatePresence mode="wait">
        {isInitializing ? (
          <motion.div
            key="loader"
            exit={{ opacity: 0 }}
            className="flex h-full min-h-[60vh] items-center justify-center animate-pulse-slow text-primary font-mono"
          >
            Connecting Logic Engine...
          </motion.div>
        ) : (
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <Routes location={location} key={location.pathname}>

              <Route path="/" element={
                <LandingPage
                  secondsToMidnight={secondsToMidnight}
                  user={user}
                  todayProgress={currentPuzzle}
                  triggerSync={() => window.location.reload()}
                />
              } />
              <Route path="/profile" element={<ProfileCenter />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/achievements" element={<ProfileCenter />} />
              <Route path="/challenge/hintless-hero" element={<HintlessHeroChallenge />} />

               <Route path="/journey" element={<JourneyMap />} />
               <Route path="/play/journey/:level" element={<JourneyGame />} />
               <Route path="/challenge/puzzle-master" element={<PuzzleMasterChallenge />} />
              <Route path="/challenge/streak-keeper" element={<StreakKeeperChallenge />} />
              <Route path="/games" element={<GamesLibrary />} />
              <Route path="/games/:type" element={<PracticeGame triggerSync={() => window.location.reload()} />} />
              <Route path="/challenge" element={<ChallengePage triggerSync={() => window.location.reload()} />} />
              <Route
                path="/landing"
                element={
                  <LandingPage
                    secondsToMidnight={secondsToMidnight}
                    user={user}
                    todayProgress={currentPuzzle}
                    triggerSync={() => window.location.reload()}
                  />
                }
              />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>

      <DailyRewardModal 
        isOpen={showDailyReward} 
        onClose={() => setShowDailyReward(false)} 
        onClaim={(reward) => {}} 
      />

      <StreakShieldPopup
        isOpen={showStreakShield}
        onClose={() => {
            setShowStreakShield(false);
            localStorage.removeItem('streak_at_risk');
        }}
        onUseShield={() => {
             setShowStreakShield(false);
             localStorage.removeItem('streak_at_risk');
             // Logic to decrement shield count in backend/cloud
        }}
        streakCount={user?.streakCount || 0}
      />

      <AchievementToast 
        achievement={lastUnlocked || {}} 
        show={showToast} 
        onClose={() => {
            setShowToast(false);
            dispatch(clearLastUnlocked());
        }} 
      />

      <AchievementCelebration
        achievement={lastUnlocked}
        isOpen={showCelebration}
        onClose={() => {
            setShowCelebration(false);
            dispatch(clearLastUnlocked());
        }}
      />
    </MainLayout>


  );
}
export default App;
