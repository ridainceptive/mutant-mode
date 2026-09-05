"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { randomBytes, Game } from "@/lib/games";
import GameWindow from "@/components/shared/GameWindow";
import GameHud from "@/components/shared/GameHud";
import MyGameWindow from "./MyGameWindow";
import MyGameSetupCard from "./MyGameSetupCard";
import { myGame } from "./myGameConfig";
import { bytesToHex, Hex } from "viem";
import { toast } from "sonner";
import { createIdleGrid, planRound, seedFromHex } from "./engine";
import { JACKPOT_MULTIPLIER } from "./paytable";
import type { Grid, SpinResult } from "./types";
import "./my-game.styles.css";

interface MyGameComponentProps {
  game?: Game;
}

interface LastRound {
  planned: SpinResult[];
  betAmount: number;
  numberOfSpins: number;
}

const MyGameComponent: React.FC<MyGameComponentProps> = ({ game: gameProp }) => {
  const game = gameProp ?? myGame;
  const router = useRouter();
  const searchParams = useSearchParams();
  const replayIdString = searchParams.get("id");
  const walletBalance = 25;
  const [currentView, setCurrentView] = useState<0 | 1 | 2>(0);
  const [betAmount, setBetAmount] = useState(1);
  const [numberOfSpins, setNumberOfSpins] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [payout, setPayout] = useState<number | null>(null);
  const [currentSpinIndex, setCurrentSpinIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [plannedSpins, setPlannedSpins] = useState<SpinResult[]>([]);
  const [displayGrid, setDisplayGrid] = useState<Grid>(() => createIdleGrid());
  const [winCells, setWinCells] = useState<Array<{ reel: number; row: number }>>([]);
  const [lastWin, setLastWin] = useState(0);
  const [lastRound, setLastRound] = useState<LastRound | null>(null);
  const [currentGameId, setCurrentGameId] = useState<bigint>(
    replayIdString == null
      ? BigInt(bytesToHex(new Uint8Array(randomBytes(32))))
      : BigInt(replayIdString),
  );
  const [userRandomWord, setUserRandomWord] = useState<Hex>(
    bytesToHex(new Uint8Array(randomBytes(32))),
  );

  const shouldShowPNL = !!payout && payout > betAmount * numberOfSpins;
  const playAgainText = `Play Again (${numberOfSpins} More Spins)`;

  useEffect(() => {
    if (replayIdString !== null && replayIdString.length > 2) {
      setIsLoading(true);
      setCurrentGameId(BigInt(replayIdString));
    }
  }, [replayIdString]);

  const getSpinsLeft = (): number => numberOfSpins - currentSpinIndex;
  const getActiveBetAmount = (): number => betAmount;

  const playGame = async (gameId?: bigint, randomWord?: Hex) => {
    if (betAmount <= 0) {
      toast.error("Enter a bet amount first.");
      return;
    }

    setIsLoading(true);

    const gameIdToUse = gameId ?? currentGameId;
    const randomWordToUse = randomWord ?? userRandomWord;

    try {
      console.log("playGame", {
        gameId: gameIdToUse.toString(),
        randomWord: randomWordToUse,
        betAmount,
        numberOfSpins,
      });

      const planned = planRound(numberOfSpins, betAmount, seedFromHex(randomWordToUse));
      setPlannedSpins(planned);
      setLastRound({ planned, betAmount, numberOfSpins });
      setDisplayGrid(createIdleGrid());
      setWinCells([]);
      setLastWin(0);
      setPayout(0);
      setCurrentSpinIndex(0);
      setGameOver(false);

      toast.success("Transaction complete!");
      window.setTimeout(() => {
        setIsLoading(false);
        setCurrentView(1);
      }, 400);
    } catch (error) {
      if (
        (error instanceof Error && error.message.includes("Transaction not found")) ||
        (typeof error === "string" && error.includes("Transaction not found"))
      ) {
        return;
      }
      console.error("An unexpected error occurred:", error);
      toast.error("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  const handleStateAdvance = () => {
    if (isSpinning || isLoading) return;
    const next = plannedSpins[currentSpinIndex];
    if (!next) return;
    setWinCells([]);
    setLastWin(0);
    setDisplayGrid(next.grid);
    setIsSpinning(true);
  };

  const handleSpinComplete = () => {
    const result = plannedSpins[currentSpinIndex];
    if (!result) {
      setIsSpinning(false);
      return;
    }

    const cells = result.lineWins.flatMap((win) => win.cells);
    if (result.scatterWin) cells.push(...result.scatterWin.cells);
    setWinCells(cells);
    setLastWin(result.totalWin);
    setPayout((prev) => (prev ?? 0) + result.totalWin);
    setIsSpinning(false);

    const nextIndex = currentSpinIndex + 1;
    setCurrentSpinIndex(nextIndex);
    if (nextIndex >= plannedSpins.length) {
      setCurrentView(2);
      window.setTimeout(() => {
        setGameOver(true);
      }, result.totalWin > 0 ? 1200 : 600);
    }
  };

  const handleReset = (isPlayingAgain = false) => {
    if (!isPlayingAgain) {
      setCurrentGameId(BigInt(bytesToHex(new Uint8Array(randomBytes(32)))));
      setUserRandomWord(bytesToHex(new Uint8Array(randomBytes(32))));
    }

    setIsSpinning(false);
    setCurrentView(0);
    setPayout(null);
    setGameOver(false);
    setCurrentSpinIndex(0);
    setPlannedSpins([]);
    setDisplayGrid(createIdleGrid());
    setWinCells([]);
    setLastWin(0);

    if (replayIdString !== null) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("id");
      router.replace(`?${params.toString()}`, { scroll: false });
    }
  };

  const handlePlayAgain = async () => {
    const newGameId = BigInt(bytesToHex(new Uint8Array(randomBytes(32))));
    const newUserWord = bytesToHex(new Uint8Array(randomBytes(32)));
    setCurrentGameId(newGameId);
    setUserRandomWord(newUserWord);
    handleReset(true);
    await playGame(newGameId, newUserWord);
  };

  const handleRewatch = () => {
    if (!lastRound) return;
    setPlannedSpins(lastRound.planned);
    setNumberOfSpins(lastRound.numberOfSpins);
    setBetAmount(lastRound.betAmount);
    setCurrentSpinIndex(0);
    setPayout(0);
    setGameOver(false);
    setIsSpinning(false);
    setDisplayGrid(lastRound.planned[0]?.grid ?? createIdleGrid());
    setWinCells([]);
    setLastWin(0);
    setCurrentView(1);
  };

  const setupCardProps = {
    game,
    onPlay: async () => await playGame(),
    onSpin: handleStateAdvance,
    onRewatch: handleRewatch,
    onReset: () => handleReset(false),
    onPlayAgain: async () => await handlePlayAgain(),
    playAgainText,
    currentView,
    betAmount: currentView === 0 ? betAmount : getActiveBetAmount(),
    setBetAmount,
    numberOfSpins,
    setNumberOfSpins,
    isLoading,
    payout,
    spinsLeft: getSpinsLeft(),
    jackpotMultiplier: JACKPOT_MULTIPLIER,
    inReplayMode: replayIdString !== null,
    account: undefined,
    walletBalance,
    playerAddress: undefined,
    isGamePaused: false,
    profile: undefined,
    minBet: 1,
    maxBet: 100,
  };

  const gameWindowContent = (
    <MyGameWindow
      game={game}
      grid={displayGrid}
      isSpinning={isSpinning}
      winCells={winCells}
      lastWin={lastWin}
      onSpinComplete={handleSpinComplete}
    />
  );

  const gameWindowShellProps = {
    game,
    currentGameId,
    isLoading,
    isGameFinished: gameOver,
    onPlayAgain: handlePlayAgain,
    playAgainText,
    onRewatch: handleRewatch,
    onReset: () => handleReset(false),
    betAmount: getActiveBetAmount(),
    payout,
    inReplayMode: replayIdString !== null,
    isUserOriginalPlayer: true,
    showPNL: shouldShowPNL,
    isGamePaused: false,
    resultModalDelayMs: 1000,
  };

  return (
    <div>
      <GameHud
        title={game.title}
        panel={<MyGameSetupCard {...setupCardProps} placement="hud" />}
      >
        <GameWindow {...gameWindowShellProps} hudMode hudSolidBackground>
          {gameWindowContent}
        </GameWindow>
      </GameHud>
    </div>
  );
};

export default MyGameComponent;
