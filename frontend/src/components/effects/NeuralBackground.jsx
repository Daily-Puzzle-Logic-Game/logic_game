import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import { THEME_CONFIG, THEMES } from '../../utils/ThemeManager';

const NeuralBackground = ({ theme = THEMES.LOGIC_LAB }) => {
    const canvasRef = useRef(null);
    const config = THEME_CONFIG[theme] || THEME_CONFIG[THEMES.LOGIC_LAB];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let particles = [];

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 1.5 + 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = config.primary + '66'; // 40% opacity hex
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            const particleCount = Math.floor((canvas.width * canvas.height) / 18000);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        };

        const drawConnections = () => {
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 150) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        
                        // Convert hex to rgba for connection gradient
                        const opacity = 0.15 * (1 - dist / 150);
                        ctx.strokeStyle = config.primary + Math.round(opacity * 255).toString(16).padStart(2, '0');
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }
        };

        const render = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw subtle themed grid
            ctx.strokeStyle = config.primary + '0a'; // ultra low opacity
            ctx.lineWidth = 1;
            const step = 80;
            
            for (let x = 0; x < canvas.width; x += step) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }
            
            for (let y = 0; y < canvas.height; y += step) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            particles.forEach(p => {
                p.update();
                p.draw();
            });
            drawConnections();

            animationFrameId = requestAnimationFrame(render);
        };

        window.addEventListener('resize', resize);
        resize();
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [theme, config.primary]);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden" style={{ background: config.background }}>
            <canvas ref={canvasRef} className="opacity-40" />
            <div 
                className="absolute inset-0"
                style={{ 
                    background: `linear-gradient(to top right, ${config.primary}11, transparent, ${config.accent}11)` 
                }}
            />
            <div className={`absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,${config.background}_100%)]`} />
        </div>
    );
};

export default NeuralBackground;
