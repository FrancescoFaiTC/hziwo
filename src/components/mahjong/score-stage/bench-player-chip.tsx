"use client";

import { cn } from "@/lib/utils";
import type { Player } from "@/lib/game/types";
import { diffTone } from "@/components/mahjong/shared/diff-tone";
import { formatSignedScore } from "@/lib/game/format-signed-score";

export function BenchPlayerChip({ player }: { player: Player }) {
  const diff = player.score - player.initialScore;
  return (
    <div className="bench-chip flex items-center gap-2 rounded-md px-2.5 py-1.5">
      <span className="max-w-14 truncate text-[11px] text-ink-soft">
        {player.name}
      </span>
      <span
        className={cn(
          "font-mono text-sm font-medium tabular-nums",
          diff === 0 ? "text-ink" : diffTone(diff)
        )}
      >
        {formatSignedScore(player.score)}
      </span>
    </div>
  );
}
