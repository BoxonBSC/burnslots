import { motion } from 'framer-motion';
import { useMemo } from 'react';

const FLOATING_ICONS = ['💎', '7️⃣', '🔔', '⭐', '🍒', '👑', '💰', '✨'];

interface FloatingElementProps {
  count?: number;
}

export function FloatingElements({ count = 6 }: FloatingElementProps) {
  const elements = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      icon: FLOATING_ICONS[Math.floor(Math.random() * FLOATING_ICONS.length)],
      left: `${10 + Math.random() * 80}%`,
      delay: Math.random() * 8,
      duration: 18 + Math.random() * 12,
      size: 14 + Math.random() * 10,
    }));
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute opacity-[0.08]"
          style={{
            left: el.left,
            fontSize: el.size,
          }}
          initial={{ y: '100vh', rotate: 0 }}
          animate={{
            y: '-100px',
            rotate: 360,
          }}
          transition={{
            duration: el.duration,
            delay: el.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {el.icon}
        </motion.div>
      ))}
    </div>
  );
}
