import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Puzzle, Zap, Shield, Star, Sparkles } from 'lucide-react';
import { formatTime } from '../utils/time';
import ParticleField from '../components/ui/ParticleField';
import CelebrationBurst from '../components/ui/CelebrationBurst';

const formatPuzzleLabel = (puzzleType) => {
  if (!puzzleType) return 'Daily Challenge';
  return puzzleType
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

const featureHighlights = [
  {
    title: 'Rotating Rituals',
    description: 'Each day delivers a different logic discipline with curated pacing.',
    icon: Shield
  },
  {
    title: 'Tracking Clarity',
    description: 'Streaks, hints, and focus segments are visualized in real-time.',
    icon: Star
  },
  {
    title: 'Momentum Lift',
    description: 'Micro-celebrations and ambient cues keep you engaged for longer.',
    icon: Sparkles
  }
];

const ritualMoments = [
  {
    stat: 'Warm-up',
    title: 'Pulse',
    description: 'Light prompts prep your mind before the main circuit.',
    icon: Activity
  },
  {
    stat: 'Spotlight',
    title: 'Circuit',
    description: 'Dive into the featured puzzle with controlled hints.',
    icon: Puzzle
  },
  {
    stat: 'Replay',
    title: 'Reflect',
    description: 'Review your streak health before resetting tomorrow.',
    icon: Zap
  }
];

const premiumPerks = [
  'Guided breathing cues and ambient gradients',
  'Elite analytics paired with global averages',
  'Priority hints after five consecutive days'
];

const LandingPage = ({ secondsToMidnight, user, todayProgress }) => {
  const navigate = useNavigate();
  const heroStats = [
    { label: 'Streak', value: `${user?.streakCount ?? 0} Days` },
    { label: 'Hints', value: user?.hintsRemaining ?? 3 },
    { label: 'Points', value: user?.totalPoints ?? 0 },
    { label: 'Reset', value: formatTime(secondsToMidnight) }
  ];
  const puzzleLabel = formatPuzzleLabel(todayProgress?.puzzleType);
  const status = todayProgress?.completed ? 'Completed' : 'Pending';

  return (
    <motion.div className="landing-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <section className="landing-hero">
        <ParticleField count={34} intensity={2} />
        <div className="landing-hero__glow" aria-hidden />
        <div className="landing-hero__celebration" aria-hidden>
          <CelebrationBurst />
        </div>
        <div className="landing-hero__grid">
          <div className="landing-hero__text">
            <p className="landing-hero__tag">Bluestock logic residency</p>
            <h1 className="landing-hero__title">
              Premium daily puzzles, curated attention, and deliberate rituals.
            </h1>
            <p className="landing-hero__subtitle">
              The Ritual Flow pairs fresh logic challenges, atmospheric cues, and premium analytics so every session feels purposeful.
            </p>
            <div className="landing-hero__cta-row">
              <button onClick={() => navigate('/')} className="landing-hero__cta">
                Return to dashboard
              </button>
              <Link to="/games" className="landing-hero__ghost">
                Explore games
              </Link>
            </div>
            <div className="landing-hero__stat-grid">
              {heroStats.map((stat) => (
                <div key={stat.label} className="landing-hero__stat">
                  <p>{stat.label}</p>
                  <p>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="landing-hero__panel glass-panel">
            <p className="landing-hero__tag">Featured puzzle</p>
            <p className="landing-hero__puzzle">{puzzleLabel}</p>
            <p className="landing-hero__status">Status: {status}</p>
            <div className="landing-daily__chip-grid">
              <div className="landing-daily__chip">
                <p>Next reset</p>
                <p>{formatTime(secondsToMidnight)}</p>
              </div>
              <div className="landing-daily__chip">
                <p>Streak</p>
                <p>{user?.streakCount ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-section landing-feature-grid">
        {featureHighlights.map((feature) => {
          const Icon = feature.icon;
          return (
            <div key={feature.title} className="landing-feature-card">
              <div className="landing-feature-card__icon">
                <Icon size={20} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          );
        })}
      </section>

      <section className="landing-section landing-daily">
        <div className="landing-daily__grid">
          <div>
            <p className="landing-hero__tag">Daily Ritual</p>
            <h3 className="landing-daily__title">Experience the flow</h3>
            <p className="landing-daily__subtitle">
              Bluestock pairs radiant gradients with intentional pacing, so you always know what comes next.
            </p>
            <div className="landing-daily__grid-cards">
              {ritualMoments.map((moment) => {
                const Icon = moment.icon;
                return (
                  <div key={moment.title} className="landing-feature-card landing-ritual-card">
                    <div className="landing-feature-card__icon">
                      <Icon size={18} />
                    </div>
                    <p className="text-[0.55rem] tracking-[0.3em] text-text-muted uppercase">{moment.stat}</p>
                    <h4>{moment.title}</h4>
                    <p className="text-xs text-text-muted">{moment.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="landing-perks">
            <p className="landing-hero__tag">Premium perks</p>
            <div className="landing-perk-list">
              {premiumPerks.map((perk) => (
                <div key={perk} className="landing-perk">
                  <span className="landing-perk__dot" />
                  <p>{perk}</p>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/')} className="landing-hero__cta">
              Start solving
            </button>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default LandingPage;
