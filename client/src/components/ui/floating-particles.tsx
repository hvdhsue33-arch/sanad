import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  color: string;
}

const colors = [
  'from-blue-400 to-purple-400',
  'from-purple-400 to-pink-400',
  'from-pink-400 to-red-400',
  'from-red-400 to-orange-400',
  'from-orange-400 to-yellow-400',
  'from-yellow-400 to-green-400',
  'from-green-400 to-blue-400',
];

export default function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 6 + 2,
      speed: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.6 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setParticles(newParticles);

    const interval = setInterval(() => {
      setParticles(prev => prev.map(particle => {
        const newY = particle.y - particle.speed;
        const newX = particle.x + Math.sin(Date.now() * 0.001 + particle.id) * 0.8;
        
        // إعادة تعيين الجزيء إذا وصل للقمة
        if (newY < -50) {
          return {
            ...particle,
            y: window.innerHeight + 50,
            x: Math.random() * window.innerWidth,
          };
        }
        
        return {
          ...particle,
          y: newY,
          x: newX,
        };
      }));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className={`absolute bg-gradient-to-r ${particle.color} rounded-full blur-sm`}
          style={{
            width: particle.size,
            height: particle.size,
            left: particle.x,
            top: particle.y,
            opacity: particle.opacity,
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [particle.opacity, particle.opacity * 1.5, particle.opacity],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
