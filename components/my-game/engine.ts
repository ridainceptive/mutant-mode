import { PAYLINES } from "./paylines";
import { linePay, scatterPayMult } from "./paytable";
import { pickSymbol, randomSymbol, SYMBOLS } from "./symbols";
import type { Grid, LineWin, ScatterWin, SpinResult, SymbolId } from "./types";
import { LINE_COUNT, REEL_COUNT, ROW_COUNT } from "./types";

export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromHex(hex: string): number {
  const compact = hex.startsWith("0x") ? hex.slice(2, 10) : hex.slice(0, 8);
  const parsed = Number.parseInt(compact, 16);
  return Number.isFinite(parsed) ? parsed : 1;
}

export function createIdleGrid(): Grid {
  return Array.from({ length: REEL_COUNT }, () =>
    Array.from({ length: ROW_COUNT }, () => randomSymbol()),
  );
}

export function generateGrid(rng: () => number = Math.random): Grid {
  return Array.from({ length: REEL_COUNT }, () =>
    Array.from({ length: ROW_COUNT }, () => pickSymbol(rng)),
  );
}

export function evaluateSpin(grid: Grid, stake: number): SpinResult {
  const perLine = stake / LINE_COUNT;
  const lineWins: LineWin[] = [];

  for (let i = 0; i < PAYLINES.length; i += 1) {
    const path = PAYLINES[i];
    if (!path) continue;
    const win = evaluateLine(grid, path, i + 1, perLine);
    if (win) lineWins.push(win);
  }

  const scatterWin = evaluateScatter(grid, stake);
  const totalWin = roundMoney(
    lineWins.reduce((sum, win) => sum + win.amount, 0) + (scatterWin?.amount ?? 0),
  );

  return {
    grid,
    lineWins,
    scatterWin,
    totalWin,
    freeSpinsAwarded: 0,
  };
}

export function planRound(spinCount: number, stake: number, seed: number): SpinResult[] {
  const rng = createRng(seed);
  return Array.from({ length: spinCount }, () => evaluateSpin(generateGrid(rng), stake));
}

function evaluateLine(
  grid: Grid,
  path: number[],
  lineNumber: number,
  perLine: number,
): LineWin | null {
  const cells = path.map((row, reel) => ({ reel, row, id: cellAt(grid, reel, row) }));
  const firstPay = cells.find(
    (cell) => SYMBOLS[cell.id].tier !== "wild" && SYMBOLS[cell.id].tier !== "scatter",
  );
  const symbol = firstPay?.id ?? (cells[0]?.id === "ooze" ? "ooze" : null);
  if (!symbol) return null;

  let count = 0;
  for (const cell of cells) {
    const tier = SYMBOLS[cell.id].tier;
    if (cell.id === symbol || (tier === "wild" && SYMBOLS[symbol].tier !== "scatter")) {
      count += 1;
      continue;
    }
    break;
  }

  if (count < 3) return null;
  const payCount = (count >= 5 ? 5 : count >= 4 ? 4 : 3) as 3 | 4 | 5;
  const amount = roundMoney(linePay(symbol, payCount) * perLine);
  if (amount <= 0) return null;

  return {
    line: lineNumber,
    symbol,
    count: payCount,
    amount,
    cells: cells.slice(0, payCount).map(({ reel, row }) => ({ reel, row })),
  };
}

function evaluateScatter(grid: Grid, stake: number): ScatterWin | null {
  const cells: Array<{ reel: number; row: number }> = [];
  for (let reel = 0; reel < REEL_COUNT; reel += 1) {
    for (let row = 0; row < ROW_COUNT; row += 1) {
      if (cellAt(grid, reel, row) === "jackpot") cells.push({ reel, row });
    }
  }
  const count = cells.length;
  const mult = scatterPayMult(count);
  if (mult <= 0) return null;
  return { count, amount: roundMoney(stake * mult), cells };
}

function cellAt(grid: Grid, reel: number, row: number): SymbolId {
  return grid[reel]?.[row] ?? "lime";
}

export function roundMoney(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function reelPreviewStrip(finalColumn: SymbolId[], filler = 18): SymbolId[] {
  const head = Array.from({ length: filler }, () => randomSymbol());
  return [...head, ...finalColumn];
}
