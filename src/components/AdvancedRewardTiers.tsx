import { motion } from 'framer-motion';
import { SYMBOLS, PAYLINES } from '@/hooks/useAdvancedSlotMachine';
import { Trophy, Medal, Award, Star, Gem, Crown } from 'lucide-react';

const rarityInfo = {
  legendary: { 
    label: '传说', 
    color: 'text-neon-yellow', 
    bg: 'bg-neon-yellow/10',
    border: 'border-neon-yellow/50',
    icon: Crown,
  },
  epic: { 
    label: '史诗', 
    color: 'text-neon-purple', 
    bg: 'bg-neon-purple/10',
    border: 'border-neon-purple/50',
    icon: Gem,
  },
  rare: { 
    label: '稀有', 
    color: 'text-neon-cyan', 
    bg: 'bg-neon-cyan/10',
    border: 'border-neon-cyan/50',
    icon: Star,
  },
  common: { 
    label: '普通', 
    color: 'text-muted-foreground', 
    bg: 'bg-muted/10',
    border: 'border-border',
    icon: Star,
  },
};

export function AdvancedRewardTiers() {
  return (
    <div className="cyber-card">
      <h3 className="text-xl font-display neon-text-purple mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5" />
        符号与赔付表
      </h3>
      
      {/* 符号表 */}
      <div className="space-y-2 mb-6">
        {SYMBOLS.map((symbol, index) => {
          const rarity = rarityInfo[symbol.rarity];
          const Icon = rarity.icon;
          
          return (
            <motion.div
              key={symbol.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`
                flex items-center gap-3 p-2 rounded-lg
                border ${rarity.border} ${rarity.bg}
                hover:bg-muted/30 transition-colors
              `}
            >
              <span className="text-2xl w-10 text-center">{symbol.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="font-display text-foreground text-sm truncate">
                  {symbol.name}
                </div>
                <div className={`text-xs flex items-center gap-1 ${rarity.color}`}>
                  <Icon className="w-3 h-3" />
                  {rarity.label}
                </div>
              </div>
              <div className="text-right">
                <div className="font-display text-foreground">{symbol.multiplier}x</div>
                <div className="text-xs text-muted-foreground">倍率</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* 赔付规则 */}
      <div className="neon-border rounded-lg p-4 bg-muted/20 mb-4">
        <h4 className="text-sm font-display text-neon-cyan mb-3 flex items-center gap-2">
          <Medal className="w-4 h-4" />
          赔付规则
        </h4>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div className="p-2 rounded bg-muted/30">
            <div className="font-display text-neon-green">3连</div>
            <div className="text-xs text-muted-foreground">基础倍率 ×1</div>
          </div>
          <div className="p-2 rounded bg-muted/30">
            <div className="font-display text-neon-yellow">4连</div>
            <div className="text-xs text-muted-foreground">基础倍率 ×2</div>
          </div>
          <div className="p-2 rounded bg-muted/30">
            <div className="font-display text-neon-pink">5连</div>
            <div className="text-xs text-muted-foreground">基础倍率 ×3</div>
          </div>
        </div>
      </div>

      {/* 赔付线信息 */}
      <div className="neon-border-purple rounded-lg p-4 bg-muted/20">
        <h4 className="text-sm font-display text-neon-purple mb-2 flex items-center gap-2">
          <Award className="w-4 h-4" />
          赔付线
        </h4>
        <p className="text-xs text-muted-foreground">
          共 {PAYLINES.length} 条赔付线，包括横线、斜线、V形和波浪形。
          多条线同时中奖时，奖励叠加！
        </p>
        <div className="mt-2 flex items-center gap-2 text-xs">
          <span className="text-neon-green">3线+: 2x倍数</span>
          <span className="text-muted-foreground">|</span>
          <span className="text-neon-yellow">5线+: 3x倍数</span>
        </div>
      </div>

      {/* 累积概率 */}
      <div className="mt-4 p-3 neon-border rounded-lg bg-muted/20">
        <h4 className="text-sm font-display text-neon-green mb-2">累积概率机制</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• 基础中奖概率: 5%</li>
          <li>• 每次未中奖增加: +2%</li>
          <li>• 最高概率上限: 50%</li>
          <li>• 中奖后概率重置</li>
        </ul>
      </div>
    </div>
  );
}
