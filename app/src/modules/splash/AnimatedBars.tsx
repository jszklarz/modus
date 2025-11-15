import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";

export const AnimatedBars = () => {
  const [mouseX, setMouseX] = useState(0);
  const barWidth = 10;
  const barCount = Math.floor(window.innerWidth / barWidth);

  const bars = useMemo(() =>
    Array.from({ length: barCount }, (_, i) => ({
      id: i,
      color: `hsl(${200 + (i * 4)}deg, 80%, 60%)`,
      oscillation: {
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2,
        offset: 0.5 + Math.random()
      },
      randomFactor: Math.random() + 1 // Pre-calculate random factor for height
    })), [barCount]
  );

  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      // Use requestAnimationFrame to throttle updates
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      rafId = requestAnimationFrame(() => {
        setMouseX(e.clientX);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div className="absolute bottom-0 left-0 w-full h-48 flex items-end overflow-hidden">
      {bars.map((bar, index) => {
        const barX = (index + 0.5) * (window.innerWidth / bars.length);
        const distance = Math.abs(mouseX - barX);
        const height = Math.max(1, 30 - (distance * 0.08) * bar.randomFactor);

        return (
          <motion.div
            key={bar.id}
            className="flex-1"
            initial={{ height: 20, translateY: 0 }}
            animate={{
              height: `${height}%`,
              translateY: [-bar.oscillation.offset, bar.oscillation.offset]
            }}
            transition={{
              height: { type: "spring", stiffness: 300, damping: 50 },
              translateY: {
                duration: bar.oscillation.duration,
                delay: bar.oscillation.delay,
                repeat: Infinity,
                repeatType: 'mirror',
                ease: 'easeInOut'
              }
            }}
            style={{
              backgroundColor: bar.color,
              margin: '0 1px',
              opacity: Math.max(0.3, 1 - (distance / 300)),
            }}
          />
        );
      })}
    </div>
  );
};
