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
      className="seat-active animate-rise flex h-[4.5rem] min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1.5"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <span className="max-w-full truncate text-center text-[11px] font-medium tracking-wide text-ink-soft">
        {player.name}
      </span>
      <span
        className={cn(
          "max-w-full truncate font-mono text-base leading-none font-semibold tracking-tight tabular-nums sm:text-lg",
          diff === 0 ? "text-ink" : diffTone(diff)
        )}
      >
        {formatSignedScore(player.score)}
      </span>
    </div>
  );
}
