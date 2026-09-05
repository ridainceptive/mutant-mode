"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { reelPreviewStrip } from "./engine";
import { SYMBOLS } from "./symbols";
import type { Grid, SymbolId } from "./types";
import { REEL_COUNT, ROW_COUNT } from "./types";

const FILLER_BASE = 14;
const STOP_STAGGER_MS = 180;

interface ReelsProps {
  grid: Grid;
  spinning: boolean;
  winCells: Array<{ reel: number; row: number }>;
  onComplete: () => void;
}

function cellKey(reel: number, row: number): string {
  return `${reel}:${row}`;
}

export function Reels({ grid, spinning, winCells, onComplete }: ReelsProps) {
  const [strips, setStrips] = useState<SymbolId[][]>(() => grid.map((column) => [...column]));
  const [offsets, setOffsets] = useState<number[]>(() => Array.from({ length: REEL_COUNT }, () => 0));
  const [moving, setMoving] = useState(false);
  const windowRef = useRef<HTMLDivElement>(null);
  const [rowStep, setRowStep] = useState(72);
  const spinGen = useRef(0);
  const onCompleteRef = useRef(onComplete);
  const gridRef = useRef(grid);
  const rowStepRef = useRef(rowStep);
  onCompleteRef.current = onComplete;
  gridRef.current = grid;
  rowStepRef.current = rowStep;

  const winSet = useMemo(
    () => new Set(winCells.map((cell) => cellKey(cell.reel, cell.row))),
    [winCells],
  );

  useEffect(() => {
    const node = windowRef.current;
    if (!node) return undefined;
    const sync = () => {
      const symbol = node.querySelector(".mm-symbol");
      if (!(symbol instanceof HTMLElement)) return;
      const gap = Number.parseFloat(getComputedStyle(node).gap || "0");
      const next = symbol.getBoundingClientRect().height + (Number.isFinite(gap) ? gap : 0);
      if (next > 0) setRowStep(next);
    };
    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!spinning) {
      setStrips(gridRef.current.map((column) => [...column]));
      setOffsets(Array.from({ length: REEL_COUNT }, () => 0));
      setMoving(false);
      return undefined;
    }

    spinGen.current += 1;
    const gen = spinGen.current;
    const nextStrips = gridRef.current.map((column, reel) =>
      reelPreviewStrip(column, FILLER_BASE + reel * 3),
    );
    setStrips(nextStrips);
    setOffsets(Array.from({ length: REEL_COUNT }, () => 0));
    setMoving(false);

    const start = window.requestAnimationFrame(() => {
      setMoving(true);
      setOffsets(nextStrips.map((strip) => Math.max(0, strip.length - ROW_COUNT) * rowStepRef.current));
    });

    const done = window.setTimeout(() => {
      if (spinGen.current !== gen) return;
      onCompleteRef.current();
    }, 1180 + (REEL_COUNT - 1) * STOP_STAGGER_MS);

    return () => {
      window.cancelAnimationFrame(start);
      window.clearTimeout(done);
    };
  }, [spinning]);

  return (
    <div className="mm-reels-frame">
      <div className="mm-reels" ref={windowRef}>
        {strips.map((strip, reel) => (
          <div className="mm-reel" key={`reel-${reel}`}>
            <div
              className={`mm-reel-strip${moving && spinning ? " is-spinning" : ""}`}
              style={{
                transform: `translateY(-${offsets[reel] ?? 0}px)`,
                transitionDuration: spinning ? `${1.15 + reel * 0.18}s` : "0s",
              }}
            >
              {strip.map((id, index) => {
                const visibleRow = index - (strip.length - ROW_COUNT);
                const winning = !spinning && visibleRow >= 0 && winSet.has(cellKey(reel, visibleRow));
                return (
                  <div className={`mm-symbol${winning ? " is-win" : ""}`} key={`${reel}-${index}-${id}`}>
                    <img src={SYMBOLS[id].src} alt={SYMBOLS[id].name} draggable={false} />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
