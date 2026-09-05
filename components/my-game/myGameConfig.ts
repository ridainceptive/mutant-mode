import { Game } from "@/lib/games";

export type GameLayout = "hud" | "two-column" | "full-size";

export const myGameLayout: GameLayout = "hud";

export const myGame: Game = {
  title: "MUTANT MODE",
  description: "A 5x4 neon mutant slot. Land three or more matching symbols across 20 lines. Mutation Ooze is wild. Jackpot crates pay anywhere.",
  gameAddress: "0x1234567890123456789012345678901234567890",
  gameBackground: "/mutant-mode/background.webp",
  card: "/mutant-mode/card.png",
  banner: "/mutant-mode/banner.png",
  themeColorBackground: "#C6FF2A",
  payouts: {
    0: {
      0: { 0: 1000000, 1: 0, 2: 0 },
      1: { 0: 0, 1: 0, 2: 0 },
      2: { 0: 0, 1: 0, 2: 0 },
    },
  },
};
