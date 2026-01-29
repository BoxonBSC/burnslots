import { motion } from 'framer-motion';
import { PAYLINES } from '@/hooks/useAdvancedSlotMachine';

interface PaylineLinesProps {
  activeLines: number[];
  showAll?: boolean;
}

const lineColors = [
  'hsl(50, 100%, 50%)',   // 金色
  'hsl(195, 100%, 50%)',  // 青色
  'hsl(320, 100%, 60%)',  // 粉色
  'hsl(280, 100%, 60%)',  // 紫色
  'hsl(150, 100%, 50%)',  // 绿色
  'hsl(25, 100%, 55%)',   // 橙色
  'hsl(0, 100%, 60%)',    // 红色
  'hsl(180, 100%, 50%)',  // 青绿
  'hsl(60, 100%, 50%)',   // 黄色
  'hsl(210, 100%, 60%)',  // 蓝色
  'hsl(330, 100%, 60%)',  // 洋红
  'hsl(90, 100%, 50%)',   // 浅绿
  'hsl(270, 100%, 60%)',  // 紫罗兰
  'hsl(15, 100%, 55%)',   // 橙红
  'hsl(165, 100%, 50%)',  // 蓝绿
];

// 格子尺寸和位置（需要和实际轮子对齐）
const CELL_WIDTH = 80; // md:w-20 = 80px
const CELL_HEIGHT = 80;
const GAP = 8; // gap-2 = 8px
const REEL_WIDTH = CELL_WIDTH;
const TOTAL_WIDTH = REEL_WIDTH * 5 + GAP * 4;

export function PaylineLines({ activeLines, showAll = false }: PaylineLinesProps) {
  const linesToShow = showAll ? PAYLINES.map((_, i) => i) : activeLines;
  
  return (
    <svg 
      className="absolute inset-0 pointer-events-none z-30"
      viewBox={`0 0 ${TOTAL_WIDTH} ${CELL_HEIGHT * 3}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {lineColors.map((color, i) => (
          <linearGradient key={i} id={`lineGradient${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="50%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.3" />
          </linearGradient>
        ))}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {linesToShow.map((lineIndex) => {
        const payline = PAYLINES[lineIndex];
        const points = payline.map((row, reel) => {
          const x = reel * (REEL_WIDTH + GAP) + REEL_WIDTH / 2;
          const y = row * CELL_HEIGHT + CELL_HEIGHT / 2;
          return `${x},${y}`;
        }).join(' ');
        
        return (
          <motion.g key={lineIndex}>
            {/* 外发光 */}
            <motion.polyline
              points={points}
              fill="none"
              stroke={lineColors[lineIndex % lineColors.length]}
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.3"
              filter="url(#glow)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ 
                pathLength: { duration: 0.5, delay: lineIndex * 0.1 },
                opacity: { duration: 1, repeat: Infinity }
              }}
            />
            {/* 主线 */}
            <motion.polyline
              points={points}
              fill="none"
              stroke={`url(#lineGradient${lineIndex % lineColors.length})`}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: lineIndex * 0.1 }}
            />
            {/* 节点 */}
            {payline.map((row, reel) => {
              const x = reel * (REEL_WIDTH + GAP) + REEL_WIDTH / 2;
              const y = row * CELL_HEIGHT + CELL_HEIGHT / 2;
              return (
                <motion.circle
                  key={`${lineIndex}-${reel}`}
                  cx={x}
                  cy={y}
                  r="4"
                  fill={lineColors[lineIndex % lineColors.length]}
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ 
                    scale: { duration: 0.5, repeat: Infinity },
                    delay: lineIndex * 0.1 + reel * 0.05
                  }}
                />
              );
            })}
          </motion.g>
        );
      })}
    </svg>
  );
}
