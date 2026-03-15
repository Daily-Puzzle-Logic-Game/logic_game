import React, { useState, useEffect } from 'react';

const Counter = ({ value, duration = 1000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = parseInt(value);
        if (start === end) return;

        let totalMiliseconds = duration;
        let incrementTime = (totalMiliseconds / end) * 5; // roughly 5ms per increment for smoothness

        let timer = setInterval(() => {
            start += Math.ceil(end / (duration / 20)); // progress based on duration
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 20);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <span>{count.toLocaleString()}</span>;
};

export default Counter;
