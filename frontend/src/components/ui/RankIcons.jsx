import React from 'react';
import { motion } from 'framer-motion';

const SVGContainer = ({ children, color, className }) => (
    <svg viewBox="0 0 100 100" fill="none" className={`w-full h-full ${className}`}>
        <defs>
            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id={`grad-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} stopOpacity="1" />
                <stop offset="100%" stopColor={color} stopOpacity="0.8" />
            </linearGradient>
        </defs>
        {children}
    </svg>
);

export const BronzeIcon = ({ color }) => (
    <SVGContainer color={color}>
        <path d="M20 20 L80 20 L80 70 L50 90 L20 70 Z" fill={`${color}20`} stroke={color} strokeWidth="4" filter="url(#glow)" />
        <path d="M35 35 L65 35 L65 60 L50 75 L35 60 Z" fill={color} opacity="0.4" />
        <path d="M50 20 L50 90" stroke={color} strokeWidth="1" opacity="0.3" />
    </SVGContainer>
);

export const SilverIcon = ({ color }) => (
    <SVGContainer color={color}>
        <path d="M50 10 L85 25 L85 75 L50 90 L15 75 L15 25 Z" fill={`${color}20`} stroke={color} strokeWidth="4" filter="url(#glow)" />
        <circle cx="50" cy="50" r="15" stroke={color} strokeWidth="3" />
        <path d="M15 25 L85 25 M15 75 L85 75" stroke={color} strokeWidth="1" opacity="0.3" />
    </SVGContainer>
);

export const GoldIcon = ({ color }) => (
    <SVGContainer color={color}>
        {/* Wings */}
        <path d="M10 40 Q25 10 50 30 Q75 10 90 40 L50 60 Z" fill={`${color}30`} />
        {/* Main Badge */}
        <path d="M30 20 L70 20 L80 50 L50 90 L20 50 Z" fill={`${color}20`} stroke={color} strokeWidth="4" filter="url(#glow)" />
        <path d="M40 30 L60 30 L65 50 L50 75 L35 50 Z" fill={color} />
    </SVGContainer>
);

export const PlatinumIcon = ({ color }) => (
    <SVGContainer color={color}>
        <path d="M20 10 L80 10 L95 40 L50 95 L5 40 Z" fill={`${color}20`} stroke={color} strokeWidth="4" filter="url(#glow)" />
        <path d="M35 25 L65 25 L75 45 L50 80 L25 45 Z" stroke={color} strokeWidth="2" />
        <path d="M50 10 L50 95" stroke={color} strokeWidth="1" opacity="0.4" strokeDasharray="4 2" />
    </SVGContainer>
);

export const DiamondIcon = ({ color }) => (
    <SVGContainer color={color}>
        <path d="M50 5 L95 35 L75 90 L25 90 L5 35 Z" fill={`${color}20`} stroke={color} strokeWidth="4" filter="url(#glow)" />
        <path d="M50 5 L75 35 L50 65 L25 35 Z" fill={color} opacity="0.6" />
        <path d="M5 35 L95 35 M25 90 L50 65 L75 90" stroke={color} strokeWidth="1" opacity="0.5" />
    </SVGContainer>
);

export const HeroicIcon = ({ color }) => (
    <SVGContainer color={color}>
        <motion.path 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1.05 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
            d="M50 5 L90 45 L50 95 L10 45 Z" 
            fill={`${color}30`} 
            stroke={color} 
            strokeWidth="5" 
            filter="url(#glow)" 
        />
        <path d="M30 45 L50 25 L70 45 L50 75 Z" fill={color} />
        <path d="M10 45 L90 45" stroke={color} strokeWidth="2" strokeDasharray="5 5" />
    </SVGContainer>
);

export const EliteHeroicIcon = ({ color }) => (
    <SVGContainer color={color}>
        <path d="M50 5 L95 50 L50 95 L5 50 Z" fill={`${color}20`} stroke={color} strokeWidth="3" />
        <motion.path 
            animate={{ rotate: [0, 90, 180, 270, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            d="M50 15 L85 50 L50 85 L15 50 Z" 
            stroke={color} 
            strokeWidth="5" 
            filter="url(#glow)" 
        />
        <circle cx="50" cy="50" r="10" fill={color} />
    </SVGContainer>
);

export const MasterIcon = ({ color }) => (
    <SVGContainer color={color}>
        {/* Large Wings */}
        <path d="M0 40 Q25 0 50 40 Q75 0 100 40 L50 80 Z" fill={`${color}20`} filter="url(#glow)" />
        {/* Central Star */}
        <polygon points="50,15 58,40 85,40 63,56 72,82 50,65 28,82 37,56 15,40 42,40" fill={color} />
    </SVGContainer>
);

export const EliteMasterIcon = ({ color }) => (
    <SVGContainer color={color}>
        <circle cx="50" cy="50" r="45" stroke={color} strokeWidth="4" filter="url(#glow)" />
        <path d="M20 50 Q50 10 80 50 Q50 90 20 50" fill={`${color}40`} />
        <path d="M50 20 L60 40 L80 50 L60 60 L50 80 L40 60 L20 50 L40 40 Z" fill={color} />
    </SVGContainer>
);

export const GrandMasterIcon = ({ color }) => (
    <SVGContainer color={color}>
        <motion.path 
            animate={{ 
                strokeDashoffset: [0, 20],
                opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            d="M50 5 L95 30 L80 85 L20 85 L5 30 Z" 
            stroke={color} 
            strokeWidth="6" 
            strokeDasharray="10 5" 
            filter="url(#glow)" 
        />
        <path d="M50 15 L75 35 L50 80 L25 35 Z" fill={color} />
        {/* Crown on top */}
        <path d="M35 15 L40 5 L50 15 L60 5 L65 15" stroke={color} strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="50" r="25" fill={`${color}20`} stroke={color} strokeWidth="1" />
    </SVGContainer>
);
