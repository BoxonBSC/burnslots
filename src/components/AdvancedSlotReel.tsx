import { motion, AnimatePresence } from 'framer-motion';
import { SYMBOLS, type SlotSymbol, type SymbolInfo } from '@/hooks/useAdvancedSlotMachine';

interface AdvancedSlotReelProps {
  symbols: SlotSymbol[];
  isSpinning: boolean;
  reelIndex: number;
  winningPositions: Set<string>;
  onSpinComplete?: () => void;
}

const getSymbolInfo = (id: SlotSymbol): SymbolInfo => {
  return SYMBOLS.find(s => s.id === id) || SYMBOLS[0];
};

const rarityGlow: Record<string, string> = {
  legendary: 'shadow-[0_0_20px_hsl(50_100%_50%/0.8),0_0_40px_hsl(50_100%_50%/0.4)]',
  epic: 'shadow-[0_0_15px_hsl(280_100%_60%/0.6),0_0_30px_hsl(280_100%_60%/0.3)]',
  rare: 'shadow-[0_0_10px_hsl(195_100%_50%/0.5),0_0_20px_hsl(195_100%_50%/0.2)]',
  common: '',
};

const rarityBorder: Record<string, string> = {
  legendary: 'border-neon-yellow',
  epic: 'border-neon-purple',
  rare: 'border-neon-cyan',
  common: 'border-border',
};

export function AdvancedSlotReel({ 
  symbols, 
  isSpinning, 
  reelIndex,
  winningPositions,
}: AdvancedSlotReelProps) {
  return (
    <div className="relative">
      {/* 轮子外框 */}
      <div className={`
        relative rounded-xl overflow-hidden
        bg-gradient-to-b from-background via-card to-background
        border-2 border-neon-purple/30
        shadow-[inset_0_0_30px_hsl(280_100%_60%/0.1),0_0_20px_hsl(280_100%_60%/0.2)]
      `}>
        {/* 顶部渐变遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
        
        {/* 底部渐变遮罩 */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
        
        {/* 符号容器 */}
        <div className="flex flex-col">
          {symbols.map((symbolId, rowIndex) => {
            const symbolInfo = getSymbolInfo(symbolId);
            const posKey = `${reelIndex}-${rowIndex}`;
            const isWinning = winningPositions.has(posKey);
            
            return (
              <motion.div
                key={`${reelIndex}-${rowIndex}-${symbolId}`}
                initial={{ y: isSpinning ? -50 : 0, opacity: 0.5 }}
                animate={{ 
                  y: 0, 
                  opacity: 1,
                  scale: isWinning ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: isSpinning ? 0.05 : 0.3,
                  delay: isSpinning ? 0 : reelIndex * 0.1 + rowIndex * 0.05,
                  scale: {
                    duration: 0.5,
                    repeat: isWinning ? Infinity : 0,
                  }
                }}
                className={`
                  relative w-16 h-16 md:w-20 md:h-20 
                  flex items-center justify-center
                  ${isWinning ? 'z-20' : 'z-0'}
                `}
              >
                {/* 符号背景 */}
                <div className={`
                  absolute inset-1 rounded-lg
                  bg-gradient-to-br from-muted/50 to-muted/20
                  border ${rarityBorder[symbolInfo.rarity]}
                  ${isWinning ? `${rarityGlow[symbolInfo.rarity]} animate-pulse` : ''}
                  transition-all duration-300
                `} />
                
                {/* 符号 */}
                <motion.span 
                  className={`
                    relative z-10 text-3xl md:text-4xl
                    ${isWinning ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}
                  `}
                  animate={isWinning ? {
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.2, 1],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: isWinning ? Infinity : 0,
                  }}
                >
                  {symbolInfo.emoji}
                </motion.span>

                {/* 中奖闪光效果 */}
                <AnimatePresence>
                  {isWinning && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: [0, 0.5, 0] }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-neon-yellow/30 via-transparent to-neon-yellow/30"
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 轮子编号 */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
        <span className="text-xs font-display text-muted-foreground">
          R{reelIndex + 1}
        </span>
      </div>
    </div>
  );
}
