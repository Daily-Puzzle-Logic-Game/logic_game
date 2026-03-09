import { motion } from 'framer-motion';

const CelebrationBurst = () => {
  const particles = Array.from({ length: 12 }, (_, index) => ({
    angle: (index / 12) * 360,
    delay: index * 0.05
  }));

  return (
    <div className="celebration-burst" aria-hidden>
      {particles.map((particle) => (
        <motion.span
          key={particle.angle}
          className="celebration-burst__dot"
          style={{ transform: `rotate(${particle.angle}deg)` }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            x: [0, Math.cos((particle.angle * Math.PI) / 180) * 120, Math.cos((particle.angle * Math.PI) / 180) * 90],
            y: [0, Math.sin((particle.angle * Math.PI) / 180) * 120, Math.sin((particle.angle * Math.PI) / 180) * 90]
          }}
          transition={{ duration: 0.9, delay: particle.delay }}
        />
      ))}
    </div>
  );
};

export default CelebrationBurst;
