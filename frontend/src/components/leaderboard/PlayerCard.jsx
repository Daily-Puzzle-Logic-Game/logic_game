import React from 'react';
import { motion } from 'framer-motion';
import { User, Timer, Trophy, Zap, Activity } from 'lucide-react';
import RankBadge from '../ui/RankBadge';
import ProgressEngine from '../../engines/ProgressEngine';
import AnimatedScore from '../effects/AnimatedScore';

const PlayerCard = ({ player, rank, isCurrentUser, previousRank }) => {
    // Rank is based on career totalXP, not just the leaderboard score (which might be daily)
    const levelInfo = ProgressEngine.getCurrentLevelInfo(player);
    const hasImproved = previousRank && rank < previousRank;
    const hasDropped = previousRank && rank > previousRank;

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.01, x: 5 }}
            className={`group relative p-4 mb-3 rounded-2xl border transition-all duration-300 flex items-center gap-4
                ${isCurrentUser 
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20' 
                    : 'bg-black/40 border-white/5 hover:border-white/10'}`}
        >
            {/* Rank Indicator */}
            <div className="w-12 flex flex-col items-center justify-center">
                <span className={`text-xl font-black ${isCurrentUser ? 'text-blue-500' : 'text-zinc-500'} italic`}>
                    #{rank}
                </span>
                {hasImproved && <div className="text-[8px] text-emerald-500 flex items-center gap-1 font-mono">▲ UP</div>}
                {hasDropped && <div className="text-[8px] text-red-500 flex items-center gap-1 font-mono">▼ DOWN</div>}
            </div>

            {/* Avatar & Activity */}
            <div className="relative">
                <div className={`w-12 h-12 rounded-xl border bg-black/60 flex items-center justify-center overflow-hidden
                    ${isCurrentUser ? 'border-blue-500' : 'border-white/5'}`}>
                    {player.avatar ? (
                        <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                    ) : (
                        <User size={24} className="text-zinc-500" />
                    )}
                </div>
                {/* Live Activity Indicator */}
                {player.isActive && (
                    <motion.div 
                        animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-black"
                    />
                )}
            </div>

            {/* Player Info */}
            <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h3 className={`text-sm font-bold truncate ${isCurrentUser ? 'text-white' : 'text-zinc-300'}`}>
                        {player.username}
                        {isCurrentUser && <span className="ml-2 text-[8px] bg-blue-500 text-white px-1.5 py-0.5 rounded uppercase">YOU</span>}
                    </h3>
                    <div className="flex gap-1">
                        {player.streak > 0 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 border border-orange-500/30 rounded-full text-orange-500 text-[9px] font-black italic">
                                <Zap size={8} className="animate-pulse" />
                                {player.streak}
                            </div>
                        )}
                        {player.perfectRuns > 0 && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-yellow-500 text-[9px] font-black italic">
                                <Trophy size={8} />
                                {player.perfectRuns}
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                        <Activity size={10} /> <AnimatedScore value={player.score} /> PTS
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono">
                        <Timer size={10} /> {player.avgTime || '--:--'}
                    </div>
                </div>
            </div>

            {/* Rank Badge */}
            <div className="flex flex-col items-center justify-center">
                <RankBadge rank={levelInfo} size="sm" />
                <span className="text-[8px] font-mono text-zinc-600 mt-1 uppercase whitespace-nowrap">
                    {levelInfo.name} {levelInfo.subRank}
                </span>
            </div>

            {/* Background Accent for current user */}
            {isCurrentUser && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-transparent rounded-2xl pointer-events-none" />
            )}
        </motion.div>
    );
};

export default PlayerCard;
