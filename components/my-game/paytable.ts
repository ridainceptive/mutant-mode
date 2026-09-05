import { SYMBOLS } from "./symbols";
import { assertNever } from "./types";
import type { SymbolId, SymbolTier } from "./types";

const TIER_PAYS: Record<Exclude<SymbolTier, "wild" | "scatter">, [number, number, number]> = {
  low: [5, 15, 50],
  mid: [10, 30, 80],
  high: [20, 80, 200],
};

export const SCATTER_PAYS: Record<3 | 4 | 5, number> = {
  3: 5,
  4: 20,
  5: 100,
};

export const JACKPOT_MULTIPLIER = 100;

export function linePay(symbol: SymbolId, count: 3 | 4 | 5): number {
  const def = SYMBOLS[symbol];
  switch (def.tier) {
    case "wild":
      return count === 3 ? 25 : count === 4 ? 100 : 400;
    case "scatter":
      return 0;
    case "low":
    case "mid":
    case "high":
      return TIER_PAYS[def.tier][count - 3];
    default:
      return assertNever(def.tier);
  }
}

export function scatterPayMult(count: number): number {
  if (count >= 5) return SCATTER_PAYS[5];
  if (count === 4) return SCATTER_PAYS[4];
  if (count === 3) return SCATTER_PAYS[3];
  return 0;
}
