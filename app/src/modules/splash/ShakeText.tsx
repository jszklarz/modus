import { motion } from "framer-motion";
import { useMemo } from "react";

interface ShakeTextProps {
  text: string;
  className?: string;
  strength?: number;
  rate?: number;
}

export function ShakeText({ text, className = "", strength = 10, rate = 20 }: ShakeTextProps) {
  // Generate random offsets for each character
  const characters = useMemo(() => {
    return text.split("").map((char, i) => {
      // Generate multiple random offsets for more jitter (like Godot's reroll_random)
      const numSteps = 10;
      const randomOffsets = Array.from({ length: numSteps }, () => ({
        x: (Math.random() - 0.5) * 2 * strength / 10,
        y: (Math.random() - 0.5) * 2 * strength / 10,
      }));

      return {
        char,
        randomOffsets,
        // Unique delay for each character to desync them
        delay: (i * 0.005) % (1 / rate),
      };
    });
  }, [text, rate, strength]);

  return (
    <div className={className} style={{ display: "inline-block" }}>
      {characters.map((item, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", whiteSpace: item.char === " " ? "pre" : "normal" }}
          animate={{
            x: item.randomOffsets.map(o => o.x),
            y: item.randomOffsets.map(o => o.y),
          }}
          transition={{
            duration: 1 / rate,
            repeat: Infinity,
            ease: [0, 0, 1, 1], // Step-like motion for jittery effect
            times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
            delay: item.delay,
          }}
        >
          {item.char}
        </motion.span>
      ))}
    </div>
  );
}
