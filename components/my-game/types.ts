export const SYMBOL_IDS = [
  "lime",
  "orange",
  "lemon",
  "ooze",
  "coins",
  "palms",
  "cocktail",
  "bubbles",
  "shaker",
  "margarita",
  "lemondrop",
  "biohazard",
  "flamingo",
  "cowboy",
  "flask",
  "tiki",
  "sunset",
  "disco",
  "surfboard",
  "jackpot",
] as const;

export type SymbolId = (typeof SYMBOL_IDS)[number];

export type SymbolTier = "low" | "mid" | "high" | "wild" | "scatter";

export interface SymbolDef {
  id: SymbolId;
  name: string;
  src: string;
  tier: SymbolTier;
  weight: number;
}

export const REEL_COUNT = 5;
export const ROW_COUNT = 4;
export const LINE_COUNT = 20;

export type Grid = SymbolId[][];

export interface LineWin {
  line: number;
  symbol: SymbolId;
  count: number;
  amount: number;
  cells: Array<{ reel: number; row: number }>;
}

export interface ScatterWin {
  count: number;
  amount: number;
  cells: Array<{ reel: number; row: number }>;
}

export interface SpinResult {
  grid: Grid;
  lineWins: LineWin[];
  scatterWin: ScatterWin | null;
  totalWin: number;
  freeSpinsAwarded: number;
}

export function assertNever(value: never): never {
  throw new Error(`Unhandled variant: ${String(value)}`);
}
