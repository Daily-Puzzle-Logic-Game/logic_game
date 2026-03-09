import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Puzzle, Zap } from 'lucide-react';
import { useGameEngine } from './hooks/useGameEngine';
import { formatTime } from './utils/time';
import PuzzleContainer from './components/puzzle/PuzzleContainer';
import Profile from './pages/Profile';
import GamesLibrary from './pages/GamesLibrary';
import PracticeGame from './pages/PracticeGame';
import ChallengePage from './pages/ChallengePage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import Leaderboard from './pages/Leaderboard';
import HintlessHeroChallenge from './pages/HintlessHeroChallenge';
import PuzzleMasterChallenge from './pages/PuzzleMasterChallenge';
import StreakKeeperChallenge from './pages/StreakKeeperChallenge';
import './App.css';

const Home = ({ secondsToMidnight, user, todayProgress }) => {
  const navigate = useNavigate();
  const ritualBriefs = [
    {
      title: 'Daily Rotation',
      note: '24H cadence',
      description: 'A new unique logic puzzle is unlocked every 24 hours at midnight IST.',
      detail: 'A steady cadence keeps your focus calibrated from one reset to the next.',
      icon: Puzzle,
      accent: 'rules-benefits__card--sky'
    },
    {
      title: 'Analyze & Solve',
      note: 'Pattern workouts',
      description: 'Decode patterns, solve binary circuits, and identify mathematical sequences.',
      detail: 'Layered hints, proof-backed breakdowns, and micro-metrics keep you in the flow state.',
      icon: Activity,
      accent: 'rules-benefits__card--violet'
    },
    {
      title: 'Build Your Streak',
      note: 'Momentum lift',
      description: 'Solve puzzles daily to maintain your streak and earn a spot on the Elite Leaderboard.',
      detail: 'Earn tiered badges and streak rewards that make each consecutive win feel meaningful.',
      icon: Zap,
      accent: 'rules-benefits__card--amber'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-16 pb-20"
    >
      {/* Hero Section */}
      <section className="home-hero relative text-center bg-report rounded-[3.5rem] pt-12 pb-16 px-6 md:px-10 shadow-2xl overflow-hidden">
        <div className="home-hero__badge">
          <Activity size={16} />
          <span>The Future of Logical Thinking</span>
        </div>
        <h1 className="home-hero__title">
          Master Your Mind with <span>Bluestock Logic</span>
        </h1>
        <p className="home-hero__subtitle">
          Thousands of traders sharpen daily intuition, solve complex logic circuits, and climb a leaderboard built for premium thinkers.
        </p>
        <div className="home-hero__actions">
          <button
            onClick={() => document.getElementById('daily-challenge').scrollIntoView({ behavior: 'smooth' })}
            className="home-hero__cta"
          >
            Play Daily Puzzle
          </button>
          <button
            onClick={() => navigate('/games')}
            className="home-hero__ghost"
          >
            Explore All Games
          </button>
        </div>
        <div className="home-hero__panel">
          <p className="home-hero__panel-label">Spotlight ritual</p>
          <p className="home-hero__panel-title">Daily logic reset</p>
          <p className="home-hero__panel-meta">New challenge lands nightly at midnight</p>
        </div>
        <div className="home-hero__orb home-hero__orb--one" aria-hidden />
        <div className="home-hero__orb home-hero__orb--two" aria-hidden />
      </section>

      {/* Main Feature: Daily Challenge */}
      <section id="daily-challenge" className="px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-between items-end mb-8 px-2">
            <div>
              <h2 className="text-2xl font-black text-brand-900">Today's Challenge</h2>
              <p className="text-text-muted text-sm capitalize">
                Streak: <span className="text-primary font-bold">{user ? user.streakCount : 0} 🔥</span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase font-bold text-text-muted tracking-widest mb-1">Time Remaining</p>
              <p className="font-mono text-xl text-brand-900 dark:text-brand-100 font-bold bg-brand-200 dark:bg-brand-800/50 px-3 py-1 rounded-lg">
                {formatTime(secondsToMidnight)}
              </p>
            </div>
          </div>

          <PuzzleContainer user={user} todayProgress={todayProgress} />
        </div>
      </section>

      <section
        className="rules-benefits"
        aria-labelledby="rules-benefits-title"
      >
        <div className="rules-benefits__surface">
          <div className="rules-benefits__glow" aria-hidden />
          <div className="rules-benefits__header">
            <p className="rules-benefits__tag">Rules & Benefits</p>
            <h2 id="rules-benefits-title">Daily rituals that sharpen your logic</h2>
            <p className="rules-benefits__lead">
              Micro-rituals, layered analytics, and ceremonial resets make each session feel intentional. The Ritual Flow keeps you engaged, accountable, and ready for the next challenge.
            </p>
          </div>
          <div className="rules-benefits__grid">
            {ritualBriefs.map((brief) => {
              const Icon = brief.icon;
              return (
                <article
                  key={brief.title}
                  className={`rules-benefits__card ${brief.accent}`}
                >
                  <div className="rules-benefits__card-header">
                    <div className="rules-benefits__card-icon">
                      <Icon size={18} />
                    </div>
                    <span className="rules-benefits__card-note">{brief.note}</span>
                  </div>
                  <h3>{brief.title}</h3>
                  <p className="rules-benefits__card-description">{brief.description}</p>
                  <p className="rules-benefits__card-detail">{brief.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer Branding */}
      <footer className="text-center py-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <img src="/logo.jpg" alt="Bluestock Logo" className="h-6 opacity-50 grayscale hover:grayscale-0 transition-all" />
          <span className="text-text-muted font-bold tracking-tighter text-lg">BLUESTOCK</span>
        </div>
        <p className="text-text-muted text-[10px] uppercase tracking-[0.2em] font-medium">
          © 2026 Bluestock Fintech • Master your logic
        </p>
      </footer>
    </motion.div>
  );
};

function App() {
  const { isInitializing, user, todayProgress, secondsToMidnight } = useGameEngine();

  return (
    <MainLayout>
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
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Routes>
              <Route path="/" element={
                <Home
                  secondsToMidnight={secondsToMidnight}
                  user={user}
                  todayProgress={todayProgress}
                />
              } />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/challenge/hintless-hero" element={<HintlessHeroChallenge />} />
              <Route path="/challenge/puzzle-master" element={<PuzzleMasterChallenge />} />
              <Route path="/challenge/streak-keeper" element={<StreakKeeperChallenge />} />
              <Route path="/games" element={<GamesLibrary />} />
              <Route path="/games/:type" element={<PracticeGame />} />
              <Route path="/challenge" element={<ChallengePage />} />
              <Route
                path="/landing"
                element={
                  <LandingPage
                    secondsToMidnight={secondsToMidnight}
                    user={user}
                    todayProgress={todayProgress}
                  />
                }
              />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}

export default App;
