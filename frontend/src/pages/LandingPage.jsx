import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import {
  ArrowRight,
  Zap,
  Brain,
  Terminal,
  Cpu,
  Activity,
  ChevronRight,
  Lock,
  ShieldCheck,
  Library,
  Trophy,
  Network,
  Wifi,
  WifiOff
} from 'lucide-react';
import PuzzleContainer from '../components/puzzle/PuzzleContainer';
import RibbonBadge from '../components/common/RibbonBadge';
import ActivityHeatmap from '../components/dashboard/ActivityHeatmap';
import ProgressEngine from '../engines/ProgressEngine';
import StreakEngine from '../engines/StreakEngine';
import RankBadge from '../components/ui/RankBadge';
import api, { getApiUrl } from '../config/api';

const LeaderboardPreview = () => {
  const [topSolvers, setTopSolvers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopSolvers = async () => {
      try {
        const todayStr = new Date(new Date().getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const res = await fetch(getApiUrl(`/api/scores/leaderboard?date=${todayStr}`));
        const data = await res.json();
        
        if (Array.isArray(data)) {
          const icons = ['🥇', '🥈', '🥉'];
          const formatted = data.slice(0, 3).map((s, i) => ({
            rank: i + 1,
            name: s.name || 'Anonymous',
            score: s.score || 0,
            icon: icons[i] || '🎯'
          }));
          setTopSolvers(formatted);
        }
      } catch (err) {
        console.error('Failed to fetch top solvers:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopSolvers();
    // Refresh every 5 minutes
    const interval = setInterval(fetchTopSolvers, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (isLoading && topSolvers.length === 0) {
    return (
      <div className="relative bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 mb-10 mx-auto max-w-[320px] h-[180px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (topSolvers.length === 0) return null;

  return (
    <div className="relative group bg-black/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 mb-10 mx-auto max-w-[320px] shadow-[0_0_30px_rgba(59,130,246,0.1)] hover:shadow-[0_0_40px_rgba(59,130,246,0.2)] transition-all overflow-hidden z-20">
      <div className="absolute inset-0 bg-blue-500/[0.03] pointer-events-none" />
      
      <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-blue-400 mb-5 flex items-center gap-2">
        <Activity size={12} className="animate-pulse" />
        Today's Top Solvers
      </h3>

      <div className="flex flex-col gap-3">
        {topSolvers.map((solver) => (
          <div key={`${solver.name}-${solver.rank}`} className="flex items-center justify-between group/row">
            <div className="flex items-center gap-3">
              <span className={`text-lg ${solver.rank === 1 ? 'animate-pulse drop-shadow-[0_0_8px_rgba(255,215,0,0.5)]' : ''}`}>
                {solver.icon}
              </span>
              <span className="text-sm font-bold text-zinc-300 group-hover/row:text-white transition-colors truncate max-w-[120px]">
                {solver.name}
              </span>
            </div>
            <motion.div 
              animate={solver.rank === 1 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-xs font-mono font-black text-blue-500"
            >
              {solver.score} <span className="text-[8px] opacity-40 uppercase">pts</span>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Shimmer effect */}
      <motion.div 
        animate={{ x: ['100%', '-100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear", repeatDelay: 5 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent skew-x-12 pointer-events-none"
      />
    </div>
  );
};

const LandingPage = ({ secondsToMidnight = 0, user = null, todayProgress = null, triggerSync = null }) => {
  const navigate = useNavigate();
  // Mock history for now if not available
  const history = user?.history || [
     { date: '2026-03-12', intensity: 2 },
     { date: '2026-03-11', intensity: 3 },
     { date: '2026-03-10', intensity: 1 }
  ];

  const levelInfo = ProgressEngine.getCurrentLevelInfo(user);
  const streakVisual = StreakEngine.getVisualTier(user?.streakCount || 0);
  const [globalStats, setGlobalStats] = useState({ totalUsers: 0, totalSolves: 0, systemStatus: 'INITIALIZING', latency: '2ms' });
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [livePulse, setLivePulse] = useState(0);
  const [graphData, setGraphData] = useState([30, 60, 45, 90, 65, 80, 55, 100, 70, 85]);

  // Reward Status Check
  const [rewardStatus, setRewardStatus] = useState({ canClaim: false });
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (user && token) {
      const fetchReward = async () => {
        try {
          const res = await api.get('/api/rewards/status');
          setRewardStatus(res.data);
        } catch (err) {
          console.error('Landing reward fetch failed:', err);
        }
      };
      fetchReward();
    }
  }, [user]);

  // Fetch Global Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/user/stats');
        const data = res.data;
        if (data && !data.message) {
          setGlobalStats(data);
        }
      } catch (err) {
        console.error('Stats fetch failed', err);
      }
    };
    fetchStats();
  }, []);

  // Monitor Connectivity & Pulse Logic
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const pulseInterval = setInterval(() => {
      setLivePulse(prev => prev + (Math.random() > 0.5 ? 1 : -1));
      setGraphData(prev => prev.map(h => Math.max(10, Math.min(100, h + (Math.random() * 10 - 5)))));
    }, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pulseInterval);
    };
  }, []);

  const formatRemaining = (sec) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const modules = [
    { title: 'Binary Circuits', desc: 'Optimize logic gates.', icon: Cpu, tag: 'DEPLOY_01', color: 'text-blue-500', border: 'border-blue-500/30' },
    { title: 'Neural Induction', desc: 'Identify non-linear patterns.', icon: Brain, tag: 'SYNC_02', color: 'text-purple-500', border: 'border-purple-500/30' },
    { title: 'Encrypted Logic', desc: 'Deduce cryptographic keys.', icon: Lock, tag: 'SEC_03', color: 'text-emerald-500', border: 'border-emerald-500/30' }
  ];

  const userAccuracy = useMemo(() => {
    if (!user || typeof user.successRate !== 'number') return '100%';
    return `${user.successRate}%`;
  }, [user]);


  return (
    <div className="w-full bg-transparent text-white selection:bg-blue-600/40 overflow-hidden relative font-sans transition-colors duration-300">
      {/* Background Grids */}
      <div className="absolute inset-0 industrial-grid opacity-[0.05] dark:opacity-[0.1] pointer-events-none" />
      <div className="absolute inset-0 industrial-grid-sub opacity-[0.02] dark:opacity-[0.05] pointer-events-none" />

      <main className="relative z-10 w-full overflow-x-hidden">
        {/* HERO MASCOT - Optimized for Mobile Overlay */}
        <div className="absolute right-[-40px] md:right-0 top-32 md:top-64 w-[280px] md:w-[320px] z-0 md:z-20 pointer-events-none opacity-[0.25] md:opacity-100">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-blue-500/10 md:bg-blue-500/20 blur-[60px] md:blur-[100px] rounded-full -z-10"
            style={{ transform: 'translate(40%, -20%)' }}
          />
          <motion.img 
            initial={{ scale: 0.15, x: 200, opacity: 0 }}
            animate={{ 
              scale: window.innerWidth < 768 ? 0.7 : 0.26, 
              x: window.innerWidth < 768 ? 0 : 200, 
              opacity: 1,
              y: [0, -10, 0]
            }}
            transition={{ 
              x: { duration: 1.4, ease: [0.22, 1, 0.36, 1] },
              y: { duration: 5, repeat: Infinity, ease: "easeInOut" },
              opacity: { duration: 1.2 }
            }}
            src="/assets/stickers/assistant_pointing.png" 
            alt="Hero Mascot" 
            className="w-full h-auto drop-shadow-[0_0_40px_rgba(59,130,246,0.1)] floating-sticker" 
            style={{ transformOrigin: 'right center' }}
          />
        </div>


        {/* HERO SECTION */}
        <section className="relative pt-20 md:pt-24 pb-32 px-6 max-w-[1400px] mx-auto">
          <div className="flex flex-col items-center text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              
              <h1 className="flex flex-col gap-2 md:gap-4 mb-6 md:mb-10 uppercase text-white max-w-5xl mx-auto relative z-20">
                <motion.span 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="text-[28px] md:text-5xl xl:text-6xl font-medium tracking-tight opacity-90"
                >
                  Train Your Brain
                </motion.span>
                <div className="flex items-center justify-center gap-4 md:gap-6">
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    className="text-[18px] md:text-3xl xl:text-4xl font-normal tracking-[0.25em] text-zinc-400"
                  >
                    Like an 
                  </motion.span>
                  <span className="relative text-[#60A5FA] font-bold text-[22px] md:text-4xl xl:text-5xl">
                    Elite
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ delay: 0.8, duration: 0.6 }}
                      className="absolute -bottom-1 md:-bottom-2 left-0 h-[2px] md:h-[4px] bg-[#60A5FA] shadow-[0_0_12px_rgba(96,165,250,0.6)]"
                    />
                  </span>
                </div>
                <motion.span 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-[36px] md:text-8xl xl:text-[7rem] font-black leading-tight tracking-tighter drop-shadow-2xl"
                >
                  Problem Solver
                </motion.span>
              </h1>

              {/* Status Chips - Moved below headline for Mobile */}
              <div className="flex flex-wrap justify-center gap-3 mb-8 md:mb-12">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-full">
                  <Zap size={10} className="text-blue-500" />
                  <span className="text-[8px] md:text-[9px] font-mono font-black tracking-widest text-blue-600 dark:text-blue-400 uppercase">Live_Updates</span>
                </div>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-full">
                  <Network size={10} className="text-slate-400" />
                  <span className="text-[8px] md:text-[9px] font-mono font-black tracking-widest text-slate-500 dark:text-zinc-500 uppercase">LATENCY: {globalStats.latency}</span>
                </div>
                <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border transition-all ${isOnline ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:border-emerald-800/30 dark:text-emerald-400' : 'bg-red-50 border-red-100 text-red-600 dark:bg-red-900/20 dark:border-red-800/30 dark:text-red-400'}`}>
                  {isOnline ? <Wifi size={10} /> : <WifiOff size={10} />}
                  <span className="text-[8px] md:text-[9px] font-mono font-black tracking-widest uppercase">{isOnline ? 'Connected' : 'Sync_Lost'}</span>
                </div>
              </div>

              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="text-base md:text-[18px] text-[#B6C2D9] max-w-[90%] md:max-w-2xl mx-auto mb-10 md:mb-16 leading-[1.6] md:leading-[1.7] font-normal"
              >
                Solve advanced logic puzzles, sharpen cognitive intuition, and compete with players worldwide.
              </motion.p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-10 mb-12 relative w-full sm:w-auto px-4 md:px-0">
                <motion.button
                  whileHover={{ y: -2, boxShadow: "0 10px 35px rgba(59,130,246,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => document.getElementById('daily-challenge').scrollIntoView({ behavior: 'smooth' })}
                  className="group relative h-[56px] md:h-[60px] px-10 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.35em] text-[12px] rounded-[14px] md:rounded-[16px] transition-all w-full sm:w-auto overflow-hidden"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                  <span className="flex items-center justify-center gap-4 relative z-10">
                    Start Training <ArrowRight size={18} />
                  </span>
                </motion.button>
                <motion.button
                  whileHover={{ y: -2, borderColor: "#3B82F6", background: "rgba(59,130,246,0.08)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/games')}
                  className="group h-[56px] md:h-[60px] px-10 bg-white/5 dark:bg-zinc-900/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-zinc-300 hover:text-blue-500 font-bold uppercase tracking-[0.3em] text-[12px] rounded-[14px] md:rounded-[16px] transition-all w-full sm:w-auto"
                >
                  <span className="flex items-center justify-center gap-4">
                    <Library size={18} /> Explore Puzzle Library
                  </span>
                </motion.button>
              </div>

              <LeaderboardPreview />

              <div className="text-center mb-24">
                <span className="inline-flex items-center gap-2 text-[11px] font-mono font-black uppercase tracking-[0.4em] text-zinc-500 dark:text-zinc-500/70">
                  <span className="text-blue-500">★</span> 10,000+ thinkers already training their logic
                </span>
              </div>

              <div className="hidden md:grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto system-panel">
                {[
                  { label: 'Neural Sync', icon: Brain, status: 'STABLE' },
                  { label: 'Circuit V4', icon: Cpu, status: 'ACTIVE' },
                  { label: 'Global Rank', icon: Trophy, status: 'SYNCED' },
                  { label: 'Journey', icon: Lock, to: '/journey' }
                ].map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 dark:bg-zinc-900/40 border border-slate-200 dark:border-white/5 rounded-2xl flex flex-col items-center gap-3 transition-colors group hover:border-blue-500/30">
                    <item.icon size={20} className="text-blue-500 group-hover:scale-110 transition-transform" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-800 dark:text-white uppercase tracking-wider">{item.label}</span>
                      {item.status && <span className="text-[8px] font-mono text-slate-400 dark:text-zinc-600">{item.status}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* BACKGROUND ENHANCEMENTS */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-blue-600/[0.08] dark:bg-blue-600/[0.12] rounded-full blur-[160px] pointer-events-none z-0" />
          
          {/* Subtle Radial Gradient behind headline */}
          <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-blue-500/[0.15] rounded-full blur-[120px] pointer-events-none z-0" />

          {/* Glowing grid lines */}
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-blue-500 to-transparent opacity-20" />
          
          {/* LOGIC THEMED BACKGROUND ELEMENTS */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Grid Nodes */}
            <div className="absolute top-[20%] left-[10%] w-2 h-2 rounded-full bg-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.2)]" />
            <div className="absolute top-[40%] right-[15%] w-1.5 h-1.5 rounded-full bg-blue-400/10" />
            
            {/* Binary Dots */}
            <motion.div 
              animate={{ opacity: [0.03, 0.08, 0.03] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-[60%] left-[5%] font-mono text-[8px] text-blue-500/10"
              style={{ writingMode: 'vertical-rl' }}
            >
              101100101
            </motion.div>

            {/* Circuit Lines */}
            <div className="absolute top-[15%] right-[20%] w-[150px] h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent rotate-45" />
            <div className="absolute bottom-[30%] left-[20%] w-[200px] h-px bg-gradient-to-r from-transparent via-blue-500/10 to-transparent -rotate-12" />

            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: Math.random() * 500 + 200, x: Math.random() * 100 + '%' }}
                animate={{ 
                  y: [null, -150],
                  opacity: [0, 0.2, 0],
                  scale: [1, 1.3, 1]
                }}
                transition={{ 
                  duration: Math.random() * 12 + 15,
                  repeat: Infinity,
                  ease: "linear",
                  delay: Math.random() * 10
                }}
                className="absolute w-1 h-1 bg-blue-400/20 rounded-full blur-[1px]"
              />
            ))}
          </div>
        </section>

        {/* SOCIAL PROOF SECTION */}
        <section className="py-20 px-6 max-w-[1400px] mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {[
              { value: '10,000+', label: 'Players', icon: Activity },
              { value: '1,200+', label: 'Logic Puzzles', icon: Brain },
              { value: '40+', label: 'Countries Competing', icon: Network },
              { value: 'Global', label: 'Leaderboards', icon: Trophy }
            ].map((stat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[2rem] flex flex-col items-center text-center group hover:border-blue-500/30 transition-all shadow-2xl"
              >
                <div className="w-12 h-12 rounded-full bg-blue-600/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon size={20} className="text-blue-500" />
                </div>
                <div className="text-3xl font-black text-white mb-1 group-hover:text-blue-400 transition-colors uppercase tracking-tighter tabular-nums">
                  {stat.value}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-32 px-6 bg-white/5 border-y border-white/5 relative overflow-hidden">
          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="text-center mb-24">
              <span className="font-mono text-xs tracking-[0.6em] text-blue-500 uppercase mb-4 block font-black">PROTOCOLS</span>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white italic">How It Works</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
              {[
                { title: 'Train Logic', desc: 'Solve structured puzzles designed to improve reasoning skills.', icon: Brain },
                { title: 'Build Skill', desc: 'Progress through increasingly complex challenges.', icon: Cpu },
                { title: 'Compete Globally', desc: 'Climb global leaderboards and challenge elite thinkers.', icon: Trophy }
              ].map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.2 }}
                  whileHover={{ y: -10 }}
                  className="p-10 bg-black/40 backdrop-blur-xl border border-white/5 rounded-[3rem] relative group"
                >
                  <div className="absolute -top-6 -left-6 w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black italic shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform">
                    0{i + 1}
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-zinc-900 flex items-center justify-center mb-8 border border-white/5 group-hover:border-blue-500/30 transition-all">
                    <step.icon size={28} className="text-blue-500" />
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-white mb-4 italic">{step.title}</h3>
                  <p className="text-zinc-500 font-light leading-relaxed">{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/[0.02] rounded-full blur-[100px] pointer-events-none translate-x-1/2 -translate-y-1/2" />
        </section>

        {/* FEATURES SECTION */}
        <section className="py-32 px-6 max-w-[1400px] mx-auto">
          <div className="space-y-40">
            {[
              {
                title: 'Advanced Logic Training',
                desc: 'Engage with puzzles designed to push your cognitive boundaries. Our adaptive difficulty ensures you are always challenged at the right level.',
                icon: Zap,
                img: '/assets/stickers/anime/girl_5.png',
                reverse: false
              },
              {
                title: 'Global Leaderboards',
                desc: 'Compete with the best minds across the globe. Track your progress in real-time and see where you stand in the hierarchy of intellect.',
                icon: Trophy,
                img: '/assets/stickers/anime/girl_8.png',
                reverse: true
              },
              {
                title: 'Massive Puzzle Library',
                desc: 'Access hundreds of puzzles across various difficulty levels. From binary logic to complex neural patterns, there is something for everyone.',
                icon: Library,
                img: '/assets/stickers/anime/girl_17.png',
                reverse: false
              }
            ].map((feature, i) => (
              <div key={i} className={`flex flex-col ${feature.reverse ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-20`}>
                <div className="flex-1 space-y-8">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center border border-blue-500/20">
                    <feature.icon size={24} className="text-blue-500" />
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white italic">{feature.title}</h3>
                  <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-xl">
                    {feature.desc}
                  </p>
                  <button className="flex items-center gap-3 text-sm font-mono font-black tracking-[0.4em] text-blue-500 uppercase hover:text-blue-400 transition-colors group">
                    Learn Protocol <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="flex-1 relative"
                >
                  <div className="absolute inset-0 bg-blue-600/10 rounded-full blur-3xl" />
                  <img 
                    src={feature.img} 
                    alt={feature.title} 
                    className="w-full max-w-md mx-auto relative z-10 drop-shadow-2xl floating-sticker" 
                  />
                </motion.div>
              </div>
            ))}
          </div>
        </section>


        {/* PROGRESSION SYSTEM SECTION */}
        <section className="py-32 px-6 max-w-[1200px] mx-auto text-center">
          <div className="mb-24">
            <span className="font-mono text-xs tracking-[0.6em] text-blue-500 uppercase block font-black">NEURAL_HIERARCHY</span>
            <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-white italic">Skill Progression</h2>
          </div>

          <div className="relative pt-12">
            <div className="absolute top-1/2 left-0 w-full h-px bg-white/10 -translate-y-1/2" />
            <div className="relative flex justify-between gap-4">
              {[
                { name: 'Beginner', color: 'bg-zinc-800' },
                { name: 'Analyst', color: 'bg-blue-900/40' },
                { name: 'Strategist', color: 'bg-blue-700/40' },
                { name: 'Master', color: 'bg-blue-600/40' },
                { name: 'Grandmaster', color: 'bg-blue-500' }
              ].map((tier, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-6 relative z-10 group"
                >
                  <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full ${tier.color} border-2 border-white/10 flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-blue-500 transition-all duration-300 relative`}>
                    <div className="absolute inset-0 bg-blue-600/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Trophy size={32} className="text-white/40 group-hover:text-white transition-colors" />
                  </div>
                  <span className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-zinc-500 group-hover:text-blue-500 transition-colors">
                    {tier.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* DAILY CHALLENGE SECTION */}
        <section id="daily-challenge" className="py-24 px-6 relative border-t border-white/5 bg-white/5">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-12 gap-8 bg-black/40 backdrop-blur-md p-8 rounded-3xl border border-white/5 shadow-2xl transition-colors">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white mb-2 italic">Today's Challenge</h2>
                  {rewardStatus.canClaim && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: [1, 1.1, 1], opacity: 1 }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="bg-accent text-white text-[10px] font-black px-3 py-1 rounded-full shadow-[0_0_15px_rgba(var(--accent-rgb),0.5)] cursor-pointer"
                      onClick={() => triggerSync && triggerSync()} // Use triggerSync instead of reload
                    >
                      🎁 REWARD UNCLAIMED
                    </motion.div>
                  )}
                </div>
                <p className="text-[10px] font-mono text-slate-500 dark:text-zinc-500 uppercase tracking-widest leading-none flex items-center gap-2">
                  Streak: <span className={`font-black ${streakVisual !== 'NONE' ? 'text-orange-500 scale-110' : 'text-blue-500'}`}>
                    {user ? user.streakCount : 0} {streakVisual === 'BLAZING_STREAK' ? '🔥🔥🔥' : streakVisual === 'STRONG_FLAME' ? '🔥🔥' : '🔥'}
                  </span>
                  {streakVisual !== 'NONE' && <span className="text-[8px] bg-orange-500/10 text-orange-500 px-2 py-0.5 rounded-full">{streakVisual}</span>}
                </p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-[10px] uppercase font-black text-slate-400 dark:text-zinc-600 tracking-[0.4em] mb-2">Next Signal In</p>
                <p className="font-mono text-4xl text-slate-900 dark:text-white font-black bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-white/5 px-6 py-2 rounded-xl tabular-nums shadow-inner transition-colors">
                  {formatRemaining(secondsToMidnight)}
                </p>
              </div>
            </div>

            {/* PROGRESSION BAR */}
            <div className="mb-8 p-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-lg">
                <div className="flex justify-between items-end mb-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3 pr-6 rounded-2xl flex items-center gap-4">
                            <RankBadge rank={levelInfo} size="sm" />
                            <div className="text-left">
                                <span className="block text-[8px] font-black text-white/40 uppercase tracking-widest leading-none mb-1">Rank_Status</span>
                                <span className="text-xl font-black text-white">
                                    {levelInfo.name} {levelInfo.subRank}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">XP Progress</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{user?.totalXP || 0} / {levelInfo.nextLevelXP || 'MAX'}</span>
                    </div>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-zinc-900 rounded-full overflow-hidden border border-slate-200 dark:border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${levelInfo.progress}%` }}
                        className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                    />
                </div>
            </div>

            <div className="p-8 bg-black/20 backdrop-blur-md border border-white/10 rounded-[3rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] min-h-[500px] transition-colors relative overflow-hidden mb-12">
              <PuzzleContainer user={user} todayProgress={todayProgress} triggerSync={triggerSync} />
              <div className="absolute inset-0 scanline-overlay opacity-[0.05] pointer-events-none" />
            </div>

            {/* ACTIVITY HEATMAP */}
            <div className="mt-12 p-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-[2.5rem] shadow-xl relative">
                 <div className="flex items-center gap-3 mb-6">
                    <Activity className="text-blue-500" size={20} />
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter">Yearly Logic Activity</h3>
                 </div>
                 <ActivityHeatmap history={history} />
            </div>
          </div>
        </section>

        {/* LOGIC LAB MODULES SECTION */}
        <section className="py-32 px-6 max-w-[1400px] mx-auto border-t border-slate-200 dark:border-white/5 relative">
          <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-12 relative z-10">
            <div className="space-y-6">
              <span className="font-mono text-xs tracking-[0.6em] text-blue-500 uppercase block font-black">SYSTEM_INFRASTRUCTURE</span>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter leading-none italic-none text-slate-950 dark:text-white">
                PROCESSING <br /> MODULES.
              </h2>
            </div>
            <p className="max-w-md text-slate-500 dark:text-zinc-500 text-lg font-light leading-relaxed border-l-2 border-blue-600 pl-8">
              High-fidelity training environments engineered to isolate and optimize specific cognitive protocols using proprietary logic gates.
            </p>
          </div>

          <div className="absolute top-0 right-0 w-80 h-auto hidden xl:block pointer-events-none opacity-40">
            <img 
               src="/assets/stickers/assistant_thinking.png" 
               alt="Thinking" 
               className="w-full h-auto drop-shadow-2xl"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-10 relative z-10">
            {modules.map((m, i) => (
              <motion.div
                key={m.title}
                whileHover={{ y: -10 }}
                onClick={() => navigate('/games')}
                className="group p-12 bg-black/40 backdrop-blur-md border border-white/5 hover:border-blue-500/30 rounded-[2.5rem] cursor-pointer relative overflow-hidden transition-all shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-8 font-mono text-[9px] text-slate-300 dark:text-zinc-800 uppercase tracking-widest">{m.tag}</div>
                <div className={`w-16 h-16 rounded-2xl bg-slate-100 dark:bg-zinc-900 flex items-center justify-center mb-10 border border-slate-200 dark:border-white/5 group-hover:border-blue-500/20 transition-all shadow-inner`}>
                  <m.icon className={m.color} size={32} />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 italic group-hover:text-blue-500 transition-colors text-slate-900 dark:text-white">{m.title}</h3>
                <p className="text-slate-500 dark:text-zinc-500 font-light leading-relaxed mb-10 text-lg">{m.desc}</p>
                <div className="flex items-center gap-3 text-[10px] font-mono font-black tracking-[0.5em] text-blue-500 uppercase opacity-40 group-hover:opacity-100 transition-all">
                  Enter_Sim <ChevronRight size={14} />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* TELEMETRY SECTION */}
        <section className="bg-white/5 border-y border-white/5 py-32 px-6 transition-colors relative">
          <div className="absolute -right-16 bottom-20 w-72 h-auto hidden xl:block pointer-events-none z-20">
            <motion.img 
              initial={{ x: 150, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              src="/assets/stickers/assistant_cheer.png" 
              alt="Cheer Mascot" 
              className="w-full h-auto drop-shadow-2xl opacity-60" 
              style={{ transform: 'scaleX(-1)' }} // Flip to point inwards
            />
          </div>

          <div className="max-w-[1400px] mx-auto grid lg:grid-cols-2 gap-32 items-center relative z-10">
            <div className="space-y-16">
              <div>
                <span className="font-mono text-xs tracking-[0.6em] text-blue-500 uppercase mb-8 block font-black">NODE_TELEMETRY</span>
                <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-10 text-slate-950 dark:text-white">
                  QUANTIFIABLE <br /> ACCURACY.
                </h2>
                <p className="text-slate-600 dark:text-zinc-400 text-xl font-light leading-relaxed max-w-xl">
                  Monitor your neural trajectory with <span className="text-slate-950 dark:text-white font-medium italic">real-time granularity</span>. Performance at scale.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-8">
                <div className="p-10 bg-white dark:bg-[#0c0c0e] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl transition-colors group hover:scale-105 transition-all">
                  <ShieldCheck className="text-blue-500 mb-6" size={24} />
                  <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Success Accuracy</div>
                  <div className="text-4xl font-black text-slate-900 dark:text-white italic">{userAccuracy}</div>
                </div>
                <div className="p-10 bg-white dark:bg-[#0c0c0e] rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-xl dark:shadow-2xl transition-colors group hover:scale-105 transition-all">
                  <Activity className="text-blue-500 mb-6" size={24} />
                  <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-600 uppercase tracking-widest mb-1">Active Solvers</div>
                  <div className="text-4xl font-black text-slate-900 dark:text-white italic tabular-nums">
                    {(globalStats.totalSolves + livePulse).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              className="p-10 bg-black/40 backdrop-blur-md rounded-[3.5rem] border border-white/5 relative aspect-square shadow-2xl overflow-hidden transition-colors flex flex-col justify-between"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="text-blue-500" size={16} />
                  <span className="font-mono text-[9px] tracking-[0.4em] text-slate-400 dark:text-zinc-600 uppercase">System.Flow_Visual</span>
                </div>
                <div className="px-3 py-1 bg-slate-100 dark:bg-zinc-900 rounded-md font-mono text-[8px] text-zinc-500 uppercase">Sector_01</div>
              </div>

              <div className="h-48 flex items-end justify-between gap-4 px-4">
                {graphData.map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-full bg-blue-500/20 dark:bg-blue-600/20 border-t border-blue-500/40 rounded-t-sm relative group"
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  >
                    <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-all" />
                  </motion.div>
                ))}
              </div>

              <div className="p-6 bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-white/5 rounded-2xl font-mono text-[11px] text-slate-500 dark:text-zinc-600 leading-loose italic transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  <span>{isOnline ? ">_ GLOBAL_SYNC: STABLE" : ">_ SYNC_ERROR: OFFLINE"}</span>
                </div>
                {isOnline ? ">_ NODE_READY_FOR_INITIATION..." : ">_ RETRYING_CONNECTION..."}
              </div>
            </motion.div>
          </div>
        </section>

        {/* FINAL SECTION */}
        <section className="py-32 px-6 bg-transparent border-t border-white/5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
             <img 
                src="/assets/stickers/assistant_trophy.png" 
                alt="" 
                className="w-full h-full object-cover grayscale brightness-50"
             />
          </div>

          <div className="max-w-[1200px] mx-auto relative z-10">
            <div className="text-center mb-16">
              <span className="font-mono text-[10px] tracking-[0.5em] text-blue-500 uppercase font-black block mb-4">NEURAL_ACHIEVEMENTS</span>
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-slate-950 dark:text-white">
                UNLOCK <br /> <span className="text-slate-300 dark:text-zinc-800">POTENTIAL.</span>
              </h2>
            </div>

            {/* Industrial Badge Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {[
                { id: 1, name: 'Pattern Master', shape: 'hexagon', ribbonType: 'ruby', icon: Zap, rarity: 'Common', desc: 'Identify complex logical patterns with ease.' },
                { id: 2, name: 'Speed Solver', shape: 'star', ribbonType: 'gold', icon: Brain, rarity: 'Legendary', desc: 'Solve advanced puzzles under record time.' },
                { id: 3, name: 'Logic Architect', shape: 'shield', ribbonType: 'silver', icon: Terminal, rarity: 'Rare', desc: 'Construct flawless logical sequences.' },
                { id: 4, name: 'Elite Thinker', shape: 'rosette', ribbonType: 'diamond', icon: Trophy, rarity: 'Epic', desc: 'Rank among the top 1% of global problem solvers.' }
              ].map((badge, idx) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group relative flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-md border border-white/5 hover:border-blue-500/50 rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/10 cursor-crosshair overflow-visible"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                  <motion.div
                    whileHover={{ rotate: [0, -5, 5, -5, 0], scale: 1.15 }}
                    transition={{ duration: 0.5 }}
                    className="w-20 h-20 flex items-center justify-center mb-6 relative z-10"
                  >
                    <RibbonBadge type={badge.ribbonType} shape={badge.shape} icon={badge.icon} size={80} className="drop-shadow-sm" />
                  </motion.div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest text-center mb-2 z-10">{badge.name}</h3>
                  <div className="text-[9px] font-mono text-blue-500 uppercase tracking-widest border border-blue-500/20 bg-blue-500/10 px-3 py-1 rounded-full mb-4 z-10">
                    {badge.rarity}
                  </div>

                  {/* Expanded Hover Info */}
                  <div className="h-0 opacity-0 group-hover:h-auto group-hover:opacity-100 transition-all duration-300 overflow-hidden text-center z-10 w-full space-y-3">
                    <div className="w-8 h-px bg-slate-200 dark:bg-white/10 mx-auto"></div>
                    <p className="text-[10px] text-slate-500 dark:text-zinc-500 font-mono leading-relaxed line-clamp-3 px-2">
                      {badge.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CALL TO ACTION */}
        <section className="py-40 px-6 relative overflow-hidden bg-black/40">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-20" />
          <div className="max-w-[1200px] mx-auto text-center relative z-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="space-y-12"
            >
              <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter text-white italic">
                Ready to Train Your Mind?
              </h2>
              <p className="text-xl md:text-2xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
                Join thousands of elite thinkers and start your journey towards cognitive mastery today.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
                <button
                  onClick={() => navigate(user ? '/games' : '/login')}
                  className="group relative px-20 py-8 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.4em] text-sm rounded-3xl transition-all hover:scale-105 shadow-[0_30px_60px_-15px_rgba(59,130,246,0.6)] hover:shadow-[0_30px_100px_rgba(59,130,246,0.8)] overflow-hidden"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"
                  />
                  <span className="flex items-center justify-center gap-4 relative z-10">
                    Start Solving Puzzles <ArrowRight size={24} />
                  </span>
                </button>
              </div>
            </motion.div>
          </div>
          
          {/* Subtle Background Animation */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/[0.05] rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
        </section>
      </main>

      {/* Matrix Corner Elements */}
      <div className="fixed bottom-12 left-12 z-[40] flex flex-col items-start gap-3 pointer-events-none opacity-40">
        <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400 dark:text-zinc-700 bg-white/50 dark:bg-black/50 px-4 py-2 border border-slate-200 dark:border-white/5 rounded-lg transition-colors">
          GRID_CORE // ALPHA_92
        </div>
        <div className={`font-mono text-[9px] uppercase tracking-[0.3em] bg-white/50 dark:bg-black/50 px-4 py-2 border rounded-lg flex items-center gap-2 transition-all ${isOnline ? 'text-blue-500 border-blue-500/10' : 'text-red-500 border-red-500/10'}`}>
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${isOnline ? 'bg-blue-500' : 'bg-red-500'}`} />
          STATUS: {isOnline ? 'SYNCED' : 'OFFLINE'}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
