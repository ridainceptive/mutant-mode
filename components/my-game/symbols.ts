import type { SymbolDef, SymbolId } from "./types";
import { SYMBOL_IDS } from "./types";

const ASSET = "/mutant-mode/symbols";

export const SYMBOLS: Record<SymbolId, SymbolDef> = {
  lime: { id: "lime", name: "Lime Wedge", src: `${ASSET}/lime-wedge.webp`, tier: "low", weight: 14 },
  orange: { id: "orange", name: "Orange Wedge", src: `${ASSET}/orange-wedge.webp`, tier: "low", weight: 14 },
  lemon: { id: "lemon", name: "Lemon Wedge", src: `${ASSET}/lemon-wedge.webp`, tier: "low", weight: 14 },
  ooze: { id: "ooze", name: "Mutation Ooze", src: `${ASSET}/mutation-ooze.webp`, tier: "wild", weight: 4 },
  coins: { id: "coins", name: "Coin Stack", src: `${ASSET}/coin-stack.webp`, tier: "high", weight: 5 },
  palms: { id: "palms", name: "Palm Trees", src: `${ASSET}/palm-trees.webp`, tier: "mid", weight: 8 },
  cocktail: { id: "cocktail", name: "Cocktail Splash", src: `${ASSET}/cocktail-splash.webp`, tier: "mid", weight: 8 },
  bubbles: { id: "bubbles", name: "Bubble Cluster", src: `${ASSET}/bubble-cluster.webp`, tier: "mid", weight: 8 },
  shaker: { id: "shaker", name: "Two-Can Shaker", src: `${ASSET}/two-can-shaker.webp`, tier: "high", weight: 5 },
  margarita: { id: "margarita", name: "Mutant Margarita", src: `${ASSET}/mutant-margarita.webp`, tier: "high", weight: 5 },
  lemondrop: { id: "lemondrop", name: "Lemon Drop Martini", src: `${ASSET}/lemon-drop-martini.webp`, tier: "high", weight: 5 },
  biohazard: { id: "biohazard", name: "Biohazard Badge", src: `${ASSET}/biohazard-badge.webp`, tier: "high", weight: 4 },
  flamingo: { id: "flamingo", name: "Neon Flamingo", src: `${ASSET}/neon-flamingo.webp`, tier: "mid", weight: 7 },
  cowboy: { id: "cowboy", name: "Cowboy Hat", src: `${ASSET}/cowboy-hat.webp`, tier: "mid", weight: 7 },
  flask: { id: "flask", name: "Lab Flask", src: `${ASSET}/lab-flask.webp`, tier: "high", weight: 4 },
  tiki: { id: "tiki", name: "Tiki Mug", src: `${ASSET}/tiki-mug.webp`, tier: "mid", weight: 7 },
  sunset: { id: "sunset", name: "Sunset Badge", src: `${ASSET}/sunset-badge.webp`, tier: "mid", weight: 8 },
  disco: { id: "disco", name: "Disco Ball", src: `${ASSET}/disco-ball.webp`, tier: "mid", weight: 7 },
  surfboard: { id: "surfboard", name: "Surfboard", src: `${ASSET}/surfboard.webp`, tier: "mid", weight: 7 },
  jackpot: { id: "jackpot", name: "Jackpot Crate", src: `${ASSET}/jackpot-crate.webp`, tier: "scatter", weight: 3 },
};

export const SYMBOL_LIST: SymbolDef[] = SYMBOL_IDS.map((id) => SYMBOLS[id]);

export const WEIGHTED_POOL: SymbolId[] = SYMBOL_LIST.flatMap((symbol) =>
  Array.from({ length: symbol.weight }, () => symbol.id),
);

export function pickSymbol(rng: () => number): SymbolId {
  const index = Math.floor(rng() * WEIGHTED_POOL.length);
  return WEIGHTED_POOL[index] ?? "lime";
}

export function randomSymbol(): SymbolId {
  return pickSymbol(Math.random);
}
