"use client";

import { cn } from "@/lib/utils";
import type { Player } from "@/lib/game/types";
import { diffTone } from "@/components/mahjong/shared/diff-tone";
import { formatSignedScore } from "@/lib/game/format-signed-score";

export function SeatedPlayerCard({
  player,
  index,
}: {
  player: Player;
  index: number;
}) {
  const diff = player.score - player.initialScore;
  return (
    <div
      className="seat-chip seat-active animate-rise flex aspect-square min-w-0 flex-1 flex-col items-center justify-center gap-2 rounded-md px-2 pt-2 pb-2.5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <span className="max-w-full truncate text-center text-[13px] font-medium tracking-wide text-ink-soft">
        {player.name}
      </span>
      <span
        className={cn(
          "font-mono text-[1.7rem] leading-none font-semibold tracking-tight tabular-nums",
          diff === 0 ? "text-ink" : diffTone(diff)
        )}
      >
        {formatSignedScore(player.score)}
      </span>
    </div>
  );
}
