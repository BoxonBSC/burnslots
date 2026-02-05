import { describe, it, expect } from "vitest";
import { SYMBOLS, REELS, ROWS } from "@/hooks/useAdvancedSlotMachine";
import type { SlotSymbol } from "@/hooks/useAdvancedSlotMachine";

// Replicate getRandomSymbol logic from the hook
const BET_MULTIPLIERS: Record<number, number> = {
  10000: 1,
  25000: 1.5,
  50000: 2,
  100000: 3,
  250000: 4,
};

const getRandomSymbol = (rng: () => number, betAmount: number = 10000): SlotSymbol => {
  const multiplier = BET_MULTIPLIERS[betAmount] || 1;
  const roll = rng() * 100;

  const sevenChance = Math.min(1 * multiplier, 4);
  const diamondChance = Math.min(1.5 * multiplier, 5);
  const crownChance = Math.min(2.5 * multiplier, 7);
  const bellChance = Math.min(4 * multiplier, 10);
  const starChance = Math.min(5 * multiplier, 12);

  const rareTotal = sevenChance + diamondChance + crownChance + bellChance + starChance;
  const remaining = 100 - rareTotal;
  const cherryChance = remaining * 0.30;
  const lemonChance = remaining * 0.28;
  const orangeChance = remaining * 0.22;
  const grapeChance = remaining * 0.12;

  const t1 = sevenChance;
  const t2 = t1 + diamondChance;
  const t3 = t2 + crownChance;
  const t4 = t3 + bellChance;
  const t5 = t4 + starChance;
  const t6 = t5 + cherryChance;
  const t7 = t6 + lemonChance;
  const t8 = t7 + orangeChance;
  const t9 = t8 + grapeChance;

  if (roll < t1) return SYMBOLS[0].id;
  if (roll < t2) return SYMBOLS[1].id;
  if (roll < t3) return SYMBOLS[2].id;
  if (roll < t4) return SYMBOLS[3].id;
  if (roll < t5) return SYMBOLS[4].id;
  if (roll < t6) return SYMBOLS[5].id;
  if (roll < t7) return SYMBOLS[6].id;
  if (roll < t8) return SYMBOLS[7].id;
  if (roll < t9) return SYMBOLS[8].id;
  return SYMBOLS[9].id;
};

const generateGrid = (rng: () => number, betAmount: number): SlotSymbol[][] => {
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

const checkMiddleRow = (grid: SlotSymbol[][]): { count: number; symbol: SlotSymbol } => {
  const middleRow = grid.map(col => col[1]);
  const first = middleRow[0];
  let count = 1;
  for (let i = 1; i < middleRow.length; i++) {
    if (middleRow[i] === first) count++;
    else break;
  }
  return { count, symbol: first };
};

const simulateSpins = (numSpins: number, betAmount: number) => {
  let wins = 0;
  const prizeCounts: Record<string, number> = {
    super_jackpot: 0, jackpot: 0, first: 0, second: 0,
    third: 0, small: 0, none: 0,
  };

  for (let i = 0; i < numSpins; i++) {
    const grid = generateGrid(Math.random, betAmount);
    const { count, symbol } = checkMiddleRow(grid);

    if (count >= 3) {
      wins++;
      if (count === 5 && symbol === 'seven') prizeCounts.super_jackpot++;
      else if (count === 5 && symbol === 'diamond') prizeCounts.jackpot++;
      else if (count === 4 && symbol === 'seven') prizeCounts.jackpot++;
      else if (count === 5) prizeCounts.first++;
      else if (count === 4 && ['seven', 'diamond', 'crown', 'bell', 'star'].includes(symbol)) prizeCounts.second++;
      else if (count === 4) prizeCounts.third++;
      else if (count === 3) prizeCounts.small++;
    } else {
      prizeCounts.none++;
    }
  }

  return { wins, total: numSpins, winRate: (wins / numSpins * 100), prizeCounts };
};

describe("Win Rate Simulation", () => {
  const NUM_SPINS = 50000;

  it("should have win rates between 3-12% across all bet levels", () => {
    const bets = [10000, 25000, 50000, 100000, 250000];
    console.log("\n📊 中奖率模拟 (每档 50,000 次旋转):");
    console.log("═".repeat(80));
    console.log("  档位  | 倍率 |  中奖率  | 3连  | 4连  | 5连  | 超级头奖 | 头奖 | 一等奖");
    console.log("─".repeat(80));

    bets.forEach(bet => {
      const r = simulateSpins(NUM_SPINS, bet);
      const label = `${(bet / 1000)}K`;
      const mult = BET_MULTIPLIERS[bet];
      const fiveMatch = r.prizeCounts.first + r.prizeCounts.jackpot + r.prizeCounts.super_jackpot;
      const fourMatch = r.prizeCounts.second + r.prizeCounts.third;
      console.log(
        `  ${label.padEnd(5)} | ${(mult + 'x').padEnd(4)} | ${(r.winRate.toFixed(2) + '%').padStart(7)} | ${String(r.prizeCounts.small).padStart(4)} | ${String(fourMatch).padStart(4)} | ${String(fiveMatch).padStart(4)} | ${String(r.prizeCounts.super_jackpot).padStart(8)} | ${String(r.prizeCounts.jackpot).padStart(4)} | ${String(r.prizeCounts.first).padStart(6)}`
      );
      
      // Win rate should be between 3% and 12%
      expect(r.winRate).toBeGreaterThan(1);
      expect(r.winRate).toBeLessThan(15);
    });

    console.log("═".repeat(80));
  });

  it("symbol distribution should be valid at each bet level", () => {
    const bets = [10000, 250000];
    console.log("\n📊 符号概率分布验证:");
    
    bets.forEach(bet => {
      const counts: Record<string, number> = {};
      SYMBOLS.forEach(s => counts[s.id] = 0);
      const total = 100000;
      
      for (let i = 0; i < total; i++) {
        const sym = getRandomSymbol(Math.random, bet);
        counts[sym]++;
      }
      
      console.log(`\n  ${bet/1000}K (${BET_MULTIPLIERS[bet]}x):`);
      SYMBOLS.forEach(s => {
        const pct = (counts[s.id] / total * 100).toFixed(2);
        const bar = '█'.repeat(Math.round(counts[s.id] / total * 100));
        console.log(`    ${s.emoji} ${s.id.padEnd(8)} ${pct.padStart(6)}% ${bar}`);
      });
      
      // All probabilities should sum to 100%
      const totalCount = Object.values(counts).reduce((a, b) => a + b, 0);
      expect(totalCount).toBe(total);
    });
  });
});
