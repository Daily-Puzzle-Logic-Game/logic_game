import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

/**
 * AnimatedScore - Counts up from zero to a target value.
 * Uses a spring for that premium "swing" feel in the numbers.
 */
const AnimatedScore = ({ value, className = "" }) => {
    const springValue = useSpring(0, {
        stiffness: 100,
        damping: 30,
    });

    useEffect(() => {
        springValue.set(value);
    }, [value, springValue]);

    // Use motion template to ensure it stays an integer
    const displayValue = useTransform(springValue, (latest) => Math.floor(latest));

    return (
        <motion.span className={className}>
            {displayValue}
        </motion.span>
    );
};

export default AnimatedScore;
