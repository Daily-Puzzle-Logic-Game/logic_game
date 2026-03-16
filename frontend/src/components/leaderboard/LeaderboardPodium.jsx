import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, User } from 'lucide-react';
import RankBadge from '../ui/RankBadge';
import ProgressEngine from '../../engines/ProgressEngine';

const PodiumPosition = ({ player, rank, heightClass, delay }) => {
    // Use career totalXP for rank badges in the leaderboard
    const levelInfo = ProgressEngine.getCurrentLevelInfo(player);
    const isFirst = rank === 1;
    
    const highlightColor = isFirst ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32';
    const highlightShadow = isFirst ? 'rgba(255, 215, 0, 0.5)' : rank === 2 ? 'rgba(192, 192, 192, 0.4)' : 'rgba(205, 127, 50, 0.4)';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.8, ease: "easeOut" }}
            className={`flex flex-col items-center relative ${isFirst ? 'z-20' : 'z-10'}`}
        >
            {/* Rank Indicator */}
            <div className="mb-4 relative group">
                <div 
                    className={`w-20 h-20 rounded-[2rem] border-2 bg-black/60 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:scale-110`}
                    style={{ borderColor: highlightColor, boxShadow: `0 0 30px ${highlightShadow}` }}
                >
                    {player.avatar ? (
                        <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />
                    ) : (
                        <User size={36} className="text-zinc-500" />
                    )}
                    
                    {isFirst && (
                        <motion.div 
                            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 bg-gradient-to-t from-[#FFD700]/30 to-transparent"
                        />
                    )}
                </div>
                
                {/* Crown / Trophy for #1 */}
                {isFirst && (
                    <motion.div 
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: delay + 0.5, type: 'spring', stiffness: 200 }}
                        className="absolute -top-5 -right-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-2 shadow-[0_0_20px_rgba(250,204,21,0.5)] z-30"
                    >
                        <Trophy size={18} className="text-white" />
                    </motion.div>
                )}
            </div>

            {/* Player Info - Floating */}
            <div className="flex flex-col items-center mb-4 text-center w-full px-2 z-30">
                <span className="text-white font-black text-sm md:text-base truncate w-full tracking-tight drop-shadow-md">
                    {player.username}
                </span>
                <span className="text-[10px] font-mono text-cyan/60 font-black uppercase tracking-widest">
                    {player.score} PTS
                </span>
            </div>

            {/* Platform */}
            <div className={`w-36 ${heightClass} bg-gradient-to-b from-white/10 via-white/5 to-transparent border-t border-x border-white/10 rounded-t-[2.5rem] flex flex-col items-center pt-6 px-3 text-center shadow-2xl relative`}>
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                
                <div className="mt-2">
                    <RankBadge rank={levelInfo} size="sm" showLabel />
                </div>
                
                <div className="text-5xl font-black opacity-10 select-none pb-4 absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-none" style={{ color: highlightColor }}>
                    #{rank}
                </div>
            </div>
        </motion.div>
    );
};

const LeaderboardPodium = ({ topPlayers = [] }) => {
    if (topPlayers.length === 0) return null;

    const rank2 = topPlayers[1];
    const rank1 = topPlayers[0];
    const rank3 = topPlayers[2];

    return (
        <div className="flex items-end justify-center gap-4 md:gap-8 pt-12 mb-16 px-4">
            {rank2 && <PodiumPosition player={rank2} rank={2} heightClass="h-44" delay={0.2} />}
            {rank1 && <PodiumPosition player={rank1} rank={1} heightClass="h-60" delay={0} />}
            {rank3 && <PodiumPosition player={rank3} rank={3} heightClass="h-36" delay={0.4} />}
        </div>
    );
};

export default LeaderboardPodium;
