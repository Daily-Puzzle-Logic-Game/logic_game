import { Routes, Route, useNavigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Puzzle, Zap } from 'lucide-react';
import { useGameEngine } from './hooks/useGameEngine';
import { formatTime } from './utils/time';
import PuzzleContainer from './components/puzzle/PuzzleContainer';
import Profile from './pages/Profile';
import GamesLibrary from './pages/GamesLibrary';
import PracticeGame from './pages/PracticeGame';

const Home = ({ secondsToMidnight, user, todayProgress }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-16 pb-20"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 md:px-8 bg-gradient-to-b from-brand-100 to-white rounded-[3rem] shadow-sm">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-widest mb-6"
          >
            <Activity size={14} />
            The Future of Logical Thinking
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-brand-900 mb-6 leading-tight">
            Master Your Mind with <br />
            <span className="text-primary italic">Bluestock Logic</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of traders and enthusiasts in the ultimate daily cognitive challenge.
            Sharpen your intuition, solve complex circuits, and climb the global leaderboard.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => document.getElementById('daily-challenge').scrollIntoView({ behavior: 'smooth' })}
              className="px-10 py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
            >
              Play Daily Puzzle
            </button>
            <button
              onClick={() => navigate('/games')}
              className="px-10 py-4 bg-white border-2 border-brand-300 text-brand-900 rounded-2xl font-bold shadow-lg hover:bg-brand-50 transition-colors"
            >
              Explore All Games
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
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
              <p className="font-mono text-xl text-brand-900 font-bold bg-brand-200 px-3 py-1 rounded-lg">
                {formatTime(secondsToMidnight)}
              </p>
            </div>
          </div>

          <PuzzleContainer user={user} todayProgress={todayProgress} />
        </div>
      </section>

      {/* Rules & Benefits Section */}
      <section className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-brand-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent/20 blur-3xl rounded-full"></div>

        <div className="space-y-4 relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
            <Puzzle className="text-primary" />
          </div>
          <h3 className="font-bold text-lg">Daily Rotation</h3>
          <p className="text-white/60 text-sm">A new unique logic puzzle is unlocked every 24 hours at midnight IST.</p>
        </div>
        <div className="space-y-4 relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
            <Activity className="text-accent" />
          </div>
          <h3 className="font-bold text-lg">Analyze & Solve</h3>
          <p className="text-white/60 text-sm">Decode patterns, solve binary circuits, and identify mathematical sequences.</p>
        </div>
        <div className="space-y-4 relative z-10">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto">
            <Zap className="text-amber-400" />
          </div>
          <h3 className="font-bold text-lg">Build Your Streak</h3>
          <p className="text-white/60 text-sm">Solve puzzles daily to maintain your streak and earn a spot on the Elite Leaderboard.</p>
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

const Leaderboard = () => (
  <div className="p-8 text-center"><h2 className="text-2xl font-bold">Global Top 100</h2><p className="text-text-muted mt-4">Coming Soon...</p></div>
);

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
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/games" element={<GamesLibrary />} />
              <Route path="/games/:type" element={<PracticeGame />} />
            </Routes>
          </motion.div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}

export default App;
