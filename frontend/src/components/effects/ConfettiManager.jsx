import confetti from 'canvas-confetti';

/**
 * ConfettiManager - Central utility for reward celebrations.
 * Provides various presets for different tiers of success.
 */
export const triggerRewardConfetti = (tier = 'basic') => {
    switch (tier) {
        case 'premium':
            // High-octane burst for major milestones
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

            const randomInRange = (min, max) => Math.random() * (max - min) + min;

            const interval = setInterval(() => {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                
                // Since particles fall down, start a bit higher than random
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
                });
                confetti({
                    ...defaults,
                    particleCount,
                    origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
                });
            }, 250);
            break;

        case 'mid':
            // Solid burst for solving a puzzle
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#06b6d4', '#ffffff'],
                gravity: 1.2,
                scalar: 1,
                zIndex: 1000
            });
            break;

        default:
            // Quick sparkle for small actions
            confetti({
                particleCount: 40,
                spread: 50,
                origin: { y: 0.7 },
                colors: ['#3b82f6', '#60a5fa'],
                zIndex: 1000
            });
            break;
    }
};

const ConfettiManager = () => null; // Side-effect only component wrapper if needed

export default ConfettiManager;
