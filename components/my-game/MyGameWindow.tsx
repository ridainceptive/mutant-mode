"use client";

import React from "react";
import { Game } from "@/lib/games";
import { Reels } from "./Reels";
import type { Grid } from "./types";

interface MyGameWindowProps {
  game: Game;
  grid: Grid;
  isSpinning: boolean;
  winCells: Array<{ reel: number; row: number }>;
  lastWin: number;
  onSpinComplete: () => void;
}

const MyGameWindow: React.FC<MyGameWindowProps> = ({
  grid,
  isSpinning,
  winCells,
  lastWin,
  onSpinComplete,
}) => {
  return (
    <div className="mm-stage">
      <div className="mm-slime" />
      <div className="mm-logo">
        <span className="mm-logo-mutant">MUTANT</span>
        <span className="mm-logo-mode">MODE</span>
      </div>
      <Reels grid={grid} spinning={isSpinning} winCells={winCells} onComplete={onSpinComplete} />
      {!isSpinning && lastWin > 0 ? <div className="mm-win-toast">{lastWin.toFixed(3)} APE</div> : null}
    </div>
  );
};

export default MyGameWindow;
