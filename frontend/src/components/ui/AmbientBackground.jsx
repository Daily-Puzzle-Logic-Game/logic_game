import React, { useEffect, useRef } from 'react';

const AmbientBackground = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        // Neural Node settings
        const nodeCount = Math.floor((window.innerWidth * window.innerHeight) / 15000);
        const nodes = [];
        const connectionDistance = 150;

        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1
            });
        }

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw connections
            ctx.lineWidth = 0.5;
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const dx = nodes[i].x - nodes[j].x;
                    const dy = nodes[i].y - nodes[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(34, 211, 238, ${0.1 * (1 - distance / connectionDistance)})`;
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw and update nodes
            for (let node of nodes) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
                ctx.fill();

                node.x += node.vx;
                node.y += node.vy;

                // Bounce
                if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
                if (node.y < 0 || node.y > canvas.height) node.vy *= -1;
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="fixed inset-0 -z-20 overflow-hidden bg-[#0F0C29]">
            {/* Deep Space Gradient */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#0F0C29] via-[#0b0a1d] to-[#0F0C29]" />
            
            <canvas 
                ref={canvasRef} 
                className="absolute inset-0 opacity-40 pointer-events-none"
            />

            {/* Subtle Grid Overlay */}
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none industrial-grid" />
            
            {/* Soft Glow Spots */}
            <div className="absolute top-0 left-0 w-full h-full bg-radial-gradient from-primary/5 to-transparent pointer-events-none" />
        </div>
    );
};

export default AmbientBackground;
