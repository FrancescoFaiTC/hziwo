"use client";

import { cn } from "@/lib/utils";
import type { Player } from "@/lib/game/types";
import { NumberStepper } from "@/components/mahjong/shared/number-stepper";
import { formatSignedScore } from "@/lib/game/format-signed-score";

export function ScoreEntryRow({
  player,
  delta,
  onChange,
}: {
  player: Player;
  delta: number;
  onChange: (n: number) => void;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2.5",
        player.atTable ? "seat-chip seat-active" : "bench-chip"
      )}
    >
      <div
        className={cn(
          "flex h-9 min-w-0 flex-1 items-center gap-2 overflow-hidden pl-1.5 text-sm leading-none",
          player.atTable ? "text-ink" : "text-ink-soft"
        )}
      >
        <span className="truncate font-medium">{player.name}</span>
        <span className="inline-flex h-3.5 shrink-0 items-center">
          <span
            className={cn(
              "text-xs leading-none tabular-nums",
              player.atTable ? "text-ink-soft/80" : "text-ink-soft/60"
            )}
          >
            {formatSignedScore(player.score)}
          </span>
        </span>
      </div>
      <NumberStepper value={delta} onChange={onChange} />
    </div>
  );
}
