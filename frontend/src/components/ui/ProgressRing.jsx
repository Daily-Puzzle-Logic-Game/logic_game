import React from 'react';
import { motion } from 'framer-motion';

const ProgressRing = ({ 
    radius = 40, 
    stroke = 4, 
    progress = 0, 
    color = "stroke-primary",
    glow = false
}) => {
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
    const strokeDashoffset = circumference - (safeProgress / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center">
            <svg
                height={radius * 2}
                width={radius * 2}
                className="transform -rotate-90"
            >
                {/* Background Ring */}
                <circle
                    stroke="rgba(255,255,255,0.05)"
                    fill="transparent"
                    strokeWidth={stroke}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                />
                {/* Progress Ring */}
                <motion.circle
                    stroke="currentColor"
                    fill="transparent"
                    strokeWidth={stroke}
                    strokeDasharray={circumference + ' ' + circumference}
                    style={{ strokeDashoffset }}
                    strokeLinecap="round"
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    className={`${color} transition-all duration-500`}
                />
            </svg>
            
            {glow && progress >= 100 && (
                <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`absolute inset-0 rounded-full blur-xl ${color.replace('stroke-', 'bg-')}`}
                />
            )}
        </div>
    );
};

export default ProgressRing;
