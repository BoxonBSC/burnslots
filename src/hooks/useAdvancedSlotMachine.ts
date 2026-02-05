import { useState, useCallback, useRef } from 'react';

// 符号类型 - 按合约顺序定义
export type SlotSymbol = 
  | 'seven' | 'diamond' | 'crown' | 'bell' | 'star'
  | 'cherry' | 'lemon' | 'orange' | 'grape' | 'clover';

export interface SymbolInfo {
  id: SlotSymbol;
  emoji: string;
  name: string;
  rarity: 'legendary' | 'epic' | 'rare' | 'common';
}

// 符号配置 - 顺序必须与合约 SYMBOL_MAP 完全一致
// 合约: 0=7️⃣, 1=💎, 2=👑, 3=🔔, 4=⭐, 5=🍒, 6=🍋, 7=🍊, 8=🍇, 9=🍀
export const SYMBOLS: SymbolInfo[] = [
  { id: 'seven', emoji: '7️⃣', name: 'Lucky Seven', rarity: 'legendary' },   // 0
  { id: 'diamond', emoji: '💎', name: 'Diamond', rarity: 'legendary' },      // 1
  { id: 'crown', emoji: '👑', name: 'Crown', rarity: 'epic' },               // 2
  { id: 'bell', emoji: '🔔', name: 'Bell', rarity: 'epic' },                 // 3
  { id: 'star', emoji: '⭐', name: 'Star', rarity: 'epic' },                 // 4
  { id: 'cherry', emoji: '🍒', name: 'Cherry', rarity: 'rare' },             // 5
  { id: 'lemon', emoji: '🍋', name: 'Lemon', rarity: 'rare' },               // 6
  { id: 'orange', emoji: '🍊', name: 'Orange', rarity: 'rare' },             // 7
  { id: 'grape', emoji: '🍇', name: 'Grape', rarity: 'common' },             // 8
  { id: 'clover', emoji: '🍀', name: 'Clover', rarity: 'common' },           // 9
];

// 5轮，每轮3行，但只有中间行有效
export const REELS = 5;
export const ROWS = 3;

// 赔付线定义 (只有中间行有效)
export const PAYLINES: number[][] = [
  [1, 1, 1, 1, 1], // 中间横线 - 唯一有效的赔付线
];

export interface WinLine {
  lineIndex: number;
  symbol: SymbolInfo;
  count: number;
  positions: [number, number][]; // [reel, row]
}

// 7级奖励系统 - 基于奖池百分比（与合约一致）
export type PrizeType = 
  | 'super_jackpot' // 超级头奖: 5个7
  | 'jackpot'       // 头奖: 5个钻石 或 4个7
  | 'first'         // 一等奖: 5个相同 (其他符号)
  | 'second'        // 二等奖: 4个相同 (高级符号)
  | 'third'         // 三等奖: 4个相同 (普通符号)
  | 'small'         // 小奖: 3个相同
  | 'consolation'   // 安慰奖: 2个相同
  | 'none';

// 奖励配置 - 基于奖池百分比
export interface PrizeConfig {
  type: PrizeType;
  name: string;
  emoji: string;
  description: string;
  poolPercent: number;  // 奖池百分比
}

// 奖池保护配置（已移除储备金，100% 可用）
export const POOL_PROTECTION = {
  maxSinglePayout: 0.5,    // 单次最大派奖 = 奖池的 50%
  reservePercent: 0,       // 无储备金
};

// 与合约常量完全一致：
// SUPER_JACKPOT_PERCENT = 5000 (50%)
// JACKPOT_PERCENT = 2500 (25%)
// FIRST_PRIZE_PERCENT = 1300 (13%)
// SECOND_PRIZE_PERCENT = 500 (5%)
// THIRD_PRIZE_PERCENT = 170 (1.7%)
// SMALL_PRIZE_PERCENT = 50 (0.5%)
// CONSOLATION_PRIZE_PERCENT = 10 (0.1%)
export const PRIZE_TIERS: PrizeConfig[] = [
  { type: 'super_jackpot', name: '超级头奖', emoji: '🎰', description: '5×7️⃣', poolPercent: 0.50 },
  { type: 'jackpot', name: '头奖', emoji: '💎', description: '5×💎 或 4×7️⃣', poolPercent: 0.25 },
  { type: 'first', name: '一等奖', emoji: '👑', description: '5个相同符号', poolPercent: 0.13 },
  { type: 'second', name: '二等奖', emoji: '🔔', description: '4个高级符号', poolPercent: 0.05 },
  { type: 'third', name: '三等奖', emoji: '⭐', description: '4个普通符号', poolPercent: 0.017 },
  { type: 'small', name: '小奖', emoji: '🍀', description: '3个相同符号', poolPercent: 0.005 },
  { type: 'consolation', name: '安慰奖', emoji: '🎁', description: '2个相同符号', poolPercent: 0.001 },
];

export interface SpinResult {
  grid: SlotSymbol[][];
  winLines: WinLine[];
  prizeType: PrizeType;
  prizeConfig: PrizeConfig | null;
  poolPayout: number;       // 从奖池派发的金额
  poolPercentUsed: number;  // 使用的奖池百分比
  isJackpot: boolean;
  hitRate: number;
}

export interface GameState {
  isSpinning: boolean;
  grid: SlotSymbol[][];
  totalSpins: number;
  totalWins: number;
  lastResult: SpinResult | null;
  combo: number;
  reelStates: ('spinning' | 'stopping' | 'stopped')[];
}

/**
 * 符号出现概率 (VRF 随机数决定):
 * 
 * 基础概率 (5K投注):
 * - 7️⃣ Lucky Seven:  0-1   (2%)   → 传奇
 * - 💎 Diamond:      2-4   (3%)   → 传奇
 * - 👑 Crown:        5-9   (5%)   → 史诗
 * - 🔔 Bell:         10-17 (8%)   → 史诗
 * - ⭐ Star:         18-27 (10%)  → 史诗
 * - 🍒 Cherry:       28-42 (15%)  → 稀有
 * - 🍇 Grape:        43-57 (15%)  → 稀有
 * - 🍉 Watermelon:   58-72 (15%)  → 稀有
 * - 🍋 Lemon:        73-87 (15%)  → 普通
 * - 🍀 Clover:       88-99 (12%)  → 普通
 * 
 * 投注倍率影响:
 * - 5K:   1x (基础概率)
 * - 10K:  2x (高级符号概率翻倍)
 * - 20K:  4x
 * - 50K:  10x
 * - 100K: 20x
 */

// 投注金额对应的概率倍数 (最低10000起)
// 高投注提升稀有符号概率（中大奖概率↑），但不显著改变总中奖率
const BET_MULTIPLIERS: Record<number, number> = {
  10000: 1,     // 基础概率
  25000: 1.5,   // 1.5倍
  50000: 2,     // 2倍
  100000: 3,    // 3倍
  250000: 4,    // 4倍
};

// 根据投注金额获取加成后的符号概率
// 设计目标：总中奖率约 5-10%
// 策略：普通符号采用不均匀分布（少数符号占主导），创造适度的3连机会
// 高投注时稀有符号概率提升，但从普通符号中按比例扣除，保持总中奖率稳定
const getRandomSymbol = (rng: () => number, betAmount: number = 10000): SlotSymbol => {
  const multiplier = BET_MULTIPLIERS[betAmount] || 1;
  const roll = rng() * 100;
  
  // 稀有符号 - 低基础概率，投注倍率可适度提升
  const sevenChance = Math.min(1 * multiplier, 4);       // 7：基础1%，最高4%
  const diamondChance = Math.min(1.5 * multiplier, 5);   // 钻石：基础1.5%，最高5%
  const crownChance = Math.min(2.5 * multiplier, 7);     // 皇冠：基础2.5%，最高7%
  const bellChance = Math.min(4 * multiplier, 10);        // 铃铛：基础4%，最高10%
  const starChance = Math.min(5 * multiplier, 12);        // 星星：基础5%，最高12%
  
  const rareTotal = sevenChance + diamondChance + crownChance + bellChance + starChance;
  
  // 普通符号采用不均匀分布 - 🍒和🍋占主导，创造更多匹配机会
  // 分配比例: 🍒30%, 🍋28%, 🍊22%, 🍇12%, 🍀8%（占剩余空间的比例）
  const remaining = 100 - rareTotal;
  const cherryChance = remaining * 0.30;
  const lemonChance = remaining * 0.28;
  const orangeChance = remaining * 0.22;
  const grapeChance = remaining * 0.12;
  // clover gets the rest (8%)
  
  const t1 = sevenChance;
  const t2 = t1 + diamondChance;
  const t3 = t2 + crownChance;
  const t4 = t3 + bellChance;
  const t5 = t4 + starChance;
  const t6 = t5 + cherryChance;
  const t7 = t6 + lemonChance;
  const t8 = t7 + orangeChance;
  const t9 = t8 + grapeChance;
  
  if (roll < t1) return SYMBOLS[0].id;  // seven
  if (roll < t2) return SYMBOLS[1].id;  // diamond
  if (roll < t3) return SYMBOLS[2].id;  // crown
  if (roll < t4) return SYMBOLS[3].id;  // bell
  if (roll < t5) return SYMBOLS[4].id;  // star
  if (roll < t6) return SYMBOLS[5].id;  // cherry
  if (roll < t7) return SYMBOLS[6].id;  // lemon
  if (roll < t8) return SYMBOLS[7].id;  // orange
  if (roll < t9) return SYMBOLS[8].id;  // grape
  return SYMBOLS[9].id;  // clover
};

const generateGrid = (rng: () => number, betAmount: number = 5000): SlotSymbol[][] => {
  const grid: SlotSymbol[][] = [];
  for (let reel = 0; reel < REELS; reel++) {
    const column: SlotSymbol[] = [];
    for (let row = 0; row < ROWS; row++) {
      column.push(getRandomSymbol(rng, betAmount));
    }
    grid.push(column);
  }
  return grid;
};

const findSymbolInfo = (id: SlotSymbol): SymbolInfo => {
  return SYMBOLS.find(s => s.id === id) || SYMBOLS[0];
};

// 计算单条赔付线
const checkPayline = (grid: SlotSymbol[][], payline: number[]): WinLine | null => {
  const positions: [number, number][] = payline.map((row, reel) => [reel, row]);
  const symbols = positions.map(([reel, row]) => grid[reel][row]);
  
  const firstSymbol = symbols[0];
  let count = 1;
  
  for (let i = 1; i < symbols.length; i++) {
    if (symbols[i] === firstSymbol) {
      count++;
    } else {
      break;
    }
  }
  
  if (count >= 3) {
    const symbolInfo = findSymbolInfo(firstSymbol);
    return {
      lineIndex: 0,
      symbol: symbolInfo,
      count,
      positions: positions.slice(0, count),
    };
  }
  
  return null;
};

export interface SpinCallbacks {
  onSpinStart?: () => void;
  onReelStop?: (reelIndex: number) => void;
  onSpinEnd?: (result: SpinResult) => void;
}

// 根据中奖线判断奖励等级
const determinePrizeType = (winLines: WinLine[]): PrizeType => {
  if (winLines.length === 0) return 'none';
  
  const hasFiveSevens = winLines.some(line => line.symbol.id === 'seven' && line.count === 5);
  const hasFiveDiamonds = winLines.some(line => line.symbol.id === 'diamond' && line.count === 5);
  const hasFourSevens = winLines.some(line => line.symbol.id === 'seven' && line.count === 4);
  const hasFiveMatch = winLines.some(line => line.count === 5);
  const hasFourLegendary = winLines.some(line => 
    (line.symbol.id === 'seven' || line.symbol.id === 'diamond') && line.count === 4
  );
  const hasFourEpic = winLines.some(line => 
    line.symbol.rarity === 'epic' && line.count === 4
  );
  const hasFourMatch = winLines.some(line => line.count === 4);
  
  if (hasFiveSevens) return 'super_jackpot';
  if (hasFiveDiamonds || hasFourSevens) return 'jackpot';
  if (hasFiveMatch) return 'first';
  if (hasFourLegendary || hasFourEpic) return 'second';
  if (hasFourMatch) return 'third';
  return 'small';
};

const findPrizeConfig = (type: PrizeType): PrizeConfig | null => {
  return PRIZE_TIERS.find(p => p.type === type) || null;
};

/**
 * 计算奖池派奖金额
 * 
 * 规则：
 * 1. 根据奖励等级获取对应的奖池百分比
 * 2. 应用最大派奖限制（不超过奖池的50%）
 * 3. 确保奖池余额高于最低阈值
 * 4. 保留一定比例作为储备
 */
const calculatePoolPayout = (
  prizeType: PrizeType,
  prizeConfig: PrizeConfig | null,
  currentPool: number
): { payout: number; percentUsed: number } => {
  if (prizeType === 'none' || !prizeConfig) {
    return { payout: 0, percentUsed: 0 };
  }

  // 可用于派奖的金额 = 奖池 - 储备金
  const availablePool = currentPool * (1 - POOL_PROTECTION.reservePercent);
  
  // 计算基础派奖 = 可用奖池 × 奖励百分比
  let basePayout = availablePool * prizeConfig.poolPercent;
  
  // 应用最大派奖限制
  const maxPayout = currentPool * POOL_PROTECTION.maxSinglePayout;
  const finalPayout = Math.min(basePayout, maxPayout);
  
  // 计算实际使用的百分比
  const percentUsed = finalPayout / currentPool;
  
  return { payout: finalPayout, percentUsed };
};

export function useAdvancedSlotMachine() {
  const [gameState, setGameState] = useState<GameState>({
    isSpinning: false,
    grid: generateGrid(Math.random),
    totalSpins: 0,
    totalWins: 0,
    lastResult: null,
    combo: 0,
    reelStates: ['stopped', 'stopped', 'stopped', 'stopped', 'stopped'],
  });

  // 模拟奖池 (实际应从链上读取)
  const [prizePool, setPrizePool] = useState(10.5);

  const callbacksRef = useRef<SpinCallbacks>({});

  const setCallbacks = useCallback((callbacks: SpinCallbacks) => {
    callbacksRef.current = callbacks;
  }, []);

  const spin = useCallback(async (betTokens: number): Promise<SpinResult> => {
    return new Promise((resolve) => {
      setGameState(prev => ({ 
        ...prev, 
        isSpinning: true,
        reelStates: ['spinning', 'spinning', 'spinning', 'spinning', 'spinning'],
      }));
      
      callbacksRef.current.onSpinStart?.();

      const stopTimes = [400, 600, 800, 1000, 1200];
      const finalGrid: SlotSymbol[][] = [];
      
      const spinInterval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          grid: generateGrid(Math.random, betTokens),
        }));
      }, 40);

      stopTimes.forEach((time, reelIndex) => {
        setTimeout(() => {
          if (reelIndex === 0) {
            clearInterval(spinInterval);
          }
          
          const column: SlotSymbol[] = [];
          for (let row = 0; row < ROWS; row++) {
            column.push(getRandomSymbol(Math.random, betTokens));
          }
          finalGrid[reelIndex] = column;
          
          setGameState(prev => {
            const newGrid = [...prev.grid];
            newGrid[reelIndex] = column;
            const newReelStates = [...prev.reelStates];
            newReelStates[reelIndex] = 'stopped';
            return { ...prev, grid: newGrid, reelStates: newReelStates };
          });
          
          callbacksRef.current.onReelStop?.(reelIndex);
        }, time);
      });

      setTimeout(() => {
        const winLines: WinLine[] = [];
        
        PAYLINES.forEach((payline, lineIndex) => {
          const win = checkPayline(finalGrid, payline);
          if (win) {
            win.lineIndex = lineIndex;
            winLines.push(win);
          }
        });

        // 判断奖励等级
        const prizeType = determinePrizeType(winLines);
        const prizeConfig = findPrizeConfig(prizeType);
        
        // 计算奖池派奖
        const { payout, percentUsed } = calculatePoolPayout(prizeType, prizeConfig, prizePool);
        
        const isJackpotWin = prizeType === 'super_jackpot' || prizeType === 'jackpot';
        const hitRate = winLines.length / PAYLINES.length;

        const result: SpinResult = {
          grid: finalGrid,
          winLines,
          prizeType,
          prizeConfig,
          poolPayout: payout,
          poolPercentUsed: percentUsed,
          isJackpot: isJackpotWin,
          hitRate,
        };

        // 更新奖池
        if (payout > 0) {
          setPrizePool(prev => prev - payout);
        }

        setGameState(prev => ({
          ...prev,
          isSpinning: false,
          grid: finalGrid,
          totalSpins: prev.totalSpins + 1,
          totalWins: winLines.length > 0 ? prev.totalWins + 1 : prev.totalWins,
          lastResult: result,
          combo: winLines.length > 0 ? prev.combo + 1 : 0,
          reelStates: ['stopped', 'stopped', 'stopped', 'stopped', 'stopped'],
        }));

        callbacksRef.current.onSpinEnd?.(result);
        resolve(result);
      }, 1400);
    });
  }, [prizePool]);

  return {
    gameState,
    prizePool,
    symbols: SYMBOLS,
    paylines: PAYLINES,
    prizeTiers: PRIZE_TIERS,
    poolProtection: POOL_PROTECTION,
    spin,
    setCallbacks,
  };
}
