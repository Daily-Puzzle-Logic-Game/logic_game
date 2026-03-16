import { useState, useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import MainLayout from './components/layout/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Puzzle, Zap } from 'lucide-react';
import ScrollToTop from './components/common/ScrollToTop';
import { useGameEngine } from './hooks/useGameEngine';
import AmbientBackground from './components/ui/AmbientBackground';
import { useDispatch, useSelector } from 'react-redux';
import './App.css';

// Lazy loaded components
const LandingPage = lazy(() => import('./pages/LandingPage'));
const ProfileCenter = lazy(() => import('./pages/ProfileCenter'));
const GamesLibrary = lazy(() => import('./pages/GamesLibrary'));
const PracticeGame = lazy(() => import('./pages/PracticeGame'));
const ChallengePage = lazy(() => import('./pages/ChallengePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const HintlessHeroChallenge = lazy(() => import('./pages/HintlessHeroChallenge'));
const PuzzleMasterChallenge = lazy(() => import('./pages/PuzzleMasterChallenge'));
const StreakKeeperChallenge = lazy(() => import('./pages/StreakKeeperChallenge'));
const JourneyMap = lazy(() => import('./pages/JourneyMap'));
const JourneyGame = lazy(() => import('./pages/JourneyGame'));

const DailyRewardModal = lazy(() => import('./components/rewards/DailyRewardModal'));
const StreakShieldPopup = lazy(() => import('./components/rewards/StreakShieldPopup'));
const AchievementToast = lazy(() => import('./components/ui/AchievementToast'));
const AchievementCelebration = lazy(() => import('./components/rewards/AchievementCelebration'));

import { clearLastUnlocked } from './store/slices/achievementSlice';
import { getApiUrl } from './config/api';

function App() {
  const dispatch = useDispatch();
  const { isInitializing, user, secondsToMidnight, refetchData } = useGameEngine();
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
    const token = localStorage.getItem('token');
    if (!isInitializing && user && token) {
      // 1. Check Daily Reward Status via API
      const checkReward = async () => {
        try {
          const res = await axios.get(getApiUrl('/api/rewards/status'), {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.data.canClaim) {
            setTimeout(() => setShowDailyReward(true), 2000);
          }
        } catch (err) {
          console.error('Initial reward check failed:', err);
        }
      };
      
      checkReward();

      // 2. Check Streak Shield (If user has shields and streak is at risk)
      const streakBroken = localStorage.getItem('streak_at_risk') === 'true';
      if (streakBroken) {
        setShowStreakShield(true);
      }
    }
  }, [isInitializing, user]);

  return (
    <MainLayout>
      <ScrollToTop />
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
            <Suspense fallback={
              <div className="flex h-64 items-center justify-center text-zinc-500 font-mono text-xs uppercase tracking-widest">
                Loading_Neural_Module...
              </div>
            }>
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={
                  <LandingPage
                    secondsToMidnight={secondsToMidnight}
                    user={user}
                    todayProgress={currentPuzzle}
                    triggerSync={() => refetchData(true)}
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
                <Route path="/games/:type" element={<PracticeGame triggerSync={() => refetchData(true)} />} />
                <Route path="/challenge" element={<ChallengePage triggerSync={() => refetchData(true)} />} />
                <Route
                  path="/landing"
                  element={
                    <LandingPage
                      secondsToMidnight={secondsToMidnight}
                      user={user}
                      todayProgress={currentPuzzle}
                      triggerSync={() => refetchData(true)}
                    />
                  }
                />
              </Routes>
            </Suspense>
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
