"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Player, RoundRecord } from "@/lib/game/types";
import { diffTone } from "@/components/mahjong/shared/diff-tone";
import { formatSignedScore } from "@/lib/game/format-signed-score";

export function RoundHistoryCard({
  round,
  roundNumber,
  players,
  onDelete,
}: {
  round: RoundRecord;
  roundNumber: number;
  players: Player[];
  onDelete: (roundId: string) => void;
}) {
  const pot = round.potDelta ?? 0;
  const entries = players
    .map((p) => ({
      id: p.id,
      name: p.name,
      delta: round.deltas[p.id] ?? 0,
    }))
    .filter((e) => e.delta !== 0);

  return (
    <div className="panel space-y-2 rounded-md p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="shrink-0 font-display text-sm text-ink">
            第 {roundNumber} 轮
          </span>
          <span className="soft-divider h-px flex-1" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 shrink-0 px-2 text-xs text-ink-soft"
          onClick={() => {
            onDelete(round.id);
            toast.message("已删除比赛记录");
          }}
        >
          删除
        </Button>
      </div>
      <div className="space-y-1.5">
        {pot !== 0 ? (
          <div className="pot-chip flex items-center justify-between rounded-md px-3 py-2">
            <span className="text-sm font-medium text-vermilion">抽水池</span>
            <span
              className={cn(
                "font-mono text-sm font-semibold tabular-nums",
                diffTone(pot)
              )}
            >
              {formatSignedScore(pot)}
            </span>
          </div>
        ) : null}
        {entries.map((e) => (
          <div
            key={e.id}
            className="seat-chip flex items-center justify-between rounded-md px-3 py-2"
          >
            <span className="min-w-0 truncate text-sm font-medium text-ink">
              {e.name}
            </span>
            <span
              className={cn(
                "shrink-0 font-mono text-sm font-semibold tabular-nums",
                diffTone(e.delta)
              )}
            >
              {formatSignedScore(e.delta)}
            </span>
          </div>
        ))}
        {pot === 0 && entries.length === 0 ? (
          <p className="px-1 py-1 text-xs text-ink-soft">本轮没有积分变动</p>
        ) : null}
      </div>
    </div>
  );
}
