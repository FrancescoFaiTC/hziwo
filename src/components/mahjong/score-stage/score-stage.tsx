"use client";

import type { Player } from "@/lib/game/types";
import { SeatedSection } from "./seated-section";
import { BenchSection } from "./bench-section";

export function ScoreStage({
  seated,
  bench,
}: {
  seated: Player[];
  bench: Player[];
}) {
  const isEmpty = seated.length === 0 && bench.length === 0;

  return (
    <div className="relative z-10 shrink-0 px-3 pt-3">
      <div className="score-stage animate-rise rounded-md px-3 pt-3 pb-4">
        <div className="space-y-3">
          <SeatedSection seated={seated} />
          <BenchSection bench={bench} />
          {isEmpty ? (
            <p className="text-center text-xs text-ink-soft">
              到「牌桌」新增玩家入座
            </p>
          ) : null}
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none mx-6 h-3 -translate-y-px rounded-b-full bg-gradient-to-b from-black/[0.03] to-transparent"
      />
    </div>
  );
}
