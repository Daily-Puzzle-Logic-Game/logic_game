import { useMemo } from 'react';
import './particleField.css';

const ParticleField = ({ count = 24, intensity = 1 }) => {
  const particles = useMemo(
    () => Array.from({ length: count }, (_, index) => ({
      delay: (index * 0.1) % 1,
      size: 6 + (index % 4) * 2,
      left: `${(index * 4) % 100}%`,
      offset: Math.random() * 40 - 20,
      duration: 6 + Math.random() * 4
    })),
    [count]
  );

  return (
    <div className="particle-field" data-intensity={intensity}>
      {particles.map((particle, index) => (
        <span
          key={`${particle.left}-${index}`}
          className="particle-field__particle"
          style={{
            left: particle.left,
            animationDelay: `${particle.delay}s`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            transform: `translateY(${particle.offset}px)`
          }}
        />
      ))}
    </div>
  );
};

export default ParticleField;
