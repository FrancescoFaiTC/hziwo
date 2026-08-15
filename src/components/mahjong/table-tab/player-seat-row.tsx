"use client";

import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type { Player } from "@/lib/game/types";
import type { GameApi } from "@/lib/game/use-game-state";
import { formatSignedScore } from "@/lib/game/format-signed-score";

export function PlayerSeatRow({
  player,
  onToggle,
}: {
  player: Player;
  onToggle: GameApi["toggleAtTable"];
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md px-3.5 py-3 seat-chip">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{player.name}</p>
        <p className="font-mono text-[11px] tabular-nums text-ink-soft">
          初始积分 {formatSignedScore(player.initialScore)} · 当前积分{" "}
          {formatSignedScore(player.score)}
        </p>
      </div>
      <button
        type="button"
        className={cn(
          "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
          player.atTable
            ? "bg-vermilion text-primary-foreground"
            : "bench-chip text-ink-soft"
        )}
        onClick={() => {
          const res = onToggle(player.id);
          if (!res.ok) toast.error(res.error);
        }}
      >
        {player.atTable ? "在座" : "候补"}
      </button>
    </div>
  );
}
