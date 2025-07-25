import React, { useState, useEffect } from 'react';

// A single particle component that manages its own animation lifecycle
const Particle: React.FC<{
  originX: number;
  originY: number;
  angle: number;
  distance: number;
  targetX: number;
  targetY: number;
}> = ({ originX, originY, angle, distance, targetX, targetY }) => {
  const [style, setStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#35A2A2', // primary color
    opacity: 1,
    transform: `translate(${originX - 4}px, ${originY - 4}px)`,
    transition: 'transform 0.5s cubic-bezier(0.17, 0.84, 0.44, 1), opacity 0.5s ease-out',
  });

  useEffect(() => {
    const burstX = originX + Math.cos(angle) * distance;
    const burstY = originY + Math.sin(angle) * distance;

    // Trigger burst animation right after mount
    const burstTimer = setTimeout(() => {
      setStyle(s => ({ ...s, transform: `translate(${burstX - 4}px, ${burstY - 4}px)` }));
    }, 10);

    // Trigger gather animation after a delay
    const gatherTimer = setTimeout(() => {
      setStyle(s => ({
        ...s,
        transform: `translate(${targetX - 4}px, ${targetY - 4}px)`,
        opacity: 0,
        transition: 'transform 0.6s cubic-bezier(0.55, 0.085, 0.68, 0.53), opacity 0.5s ease-in 0.4s',
      }));
    }, 600);
    
    return () => {
      clearTimeout(burstTimer);
      clearTimeout(gatherTimer);
    };
  }, [originX, originY, angle, distance, targetX, targetY]);

  return <div style={style} />;
};


interface ParticleBurstProps {
  origin: { x: number; y: number; };
  onComplete: () => void;
}

// Main component to manage the burst effect
const ParticleBurst: React.FC<ParticleBurstProps> = ({ origin, onComplete }) => {
  const [particles, setParticles] = useState<{ id: number; angle: number; distance: number; }[]>([]);

  useEffect(() => {
    const newParticles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      angle: Math.random() * 2 * Math.PI,
      distance: 150 * (Math.random() * 0.8 + 0.2), // avoid particles being too close to origin
    }));
    setParticles(newParticles);
    
    // Call onComplete after the entire animation is finished to unmount the component
    // Animation is ~600ms pause + 600ms gather = 1200ms. Add a buffer.
    const timer = setTimeout(onComplete, 1500);
    return () => clearTimeout(timer);
  }, [onComplete]);
  
  const badge = document.getElementById('request-notification-badge');
  const badgeRect = badge?.getBoundingClientRect();

  // Calculate target coordinates, with fallback
  const targetX = badgeRect ? badgeRect.left + badgeRect.width / 2 : window.innerWidth / 2;
  const targetY = badgeRect ? badgeRect.top + badgeRect.height / 2 : 100;

  return (
    <>
      {particles.map(p => (
        <Particle
          key={p.id}
          originX={origin.x}
          originY={origin.y}
          angle={p.angle}
          distance={p.distance}
          targetX={targetX}
          targetY={targetY}
        />
      ))}
    </>
  );
};

export default ParticleBurst;
