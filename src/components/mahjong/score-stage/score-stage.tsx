"use client";

import type { Player } from "@/lib/game/types";
import { SeatedSection } from "./seated-section";
import { BenchSection } from "./bench-section";

export function ScoreStage({
  players,
  seated,
  bench,
}: {
  players: Player[];
  seated: Player[];
  bench: Player[];
}) {
  return (
    <div className="relative z-10 shrink-0 px-3 pt-3">
      <div className="score-stage animate-rise rounded-md px-3 pt-3 pb-4">
        {players.length === 0 ? (
          <div className="py-8 text-center">
            <p className="font-display text-base text-ink/70">牌桌没有玩家</p>
            <p className="mt-1 text-xs text-ink-soft">到「牌桌」新增玩家</p>
          </div>
        ) : (
          <div className="space-y-3">
            <SeatedSection seated={seated} />
            <BenchSection bench={bench} />
          </div>
        )}
      </div>
      <div
        aria-hidden
        className="pointer-events-none mx-6 h-3 -translate-y-px rounded-b-full bg-gradient-to-b from-black/[0.03] to-transparent"
      />
    </div>
  );
}
