"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Player } from "@/lib/game/types";
import { EmptyHint } from "@/components/mahjong/shared/empty-hint";
import { formatSignedScore } from "@/lib/game/format-signed-score";
import { PotEntryRow } from "./pot-entry-row";
import { ScoreEntryRow } from "./score-entry-row";

export function RoundTab({
  isPlaying,
  players,
  pot,
  potDelta,
  deltas,
  totalSum,
  recordRound,
  canUndo,
  onPotDeltaChange,
  onDeltaChange,
  onRecordRoundChange,
  onUndo,
  onSettle,
  onGoEnd,
  onGoTable,
}: {
  isPlaying: boolean;
  players: Player[];
  pot: number;
  potDelta: number;
  deltas: Record<string, number>;
  totalSum: number;
  recordRound: boolean;
  canUndo: boolean;
  onPotDeltaChange: (n: number) => void;
  onDeltaChange: (playerId: string, n: number) => void;
  onRecordRoundChange: (v: boolean) => void;
  onUndo: () => void;
  onSettle: () => void;
  onGoEnd: () => void;
  onGoTable: () => void;
}) {
  const orderedPlayers = [
    ...players.filter((p) => p.atTable),
    ...players.filter((p) => !p.atTable),
  ];
  if (!isPlaying) {
    return (
      <EmptyHint
        title="比赛结算中"
        desc="计分已暂停"
        action="前往结算"
        onAction={onGoEnd}
      />
    );
  }

  if (players.length === 0) {
    return (
      <EmptyHint
        title="还没有玩家"
        desc="至少新增一名玩家"
        action="去牌桌"
        onAction={onGoTable}
      />
    );
  }

  return (
    <div className="animate-fade flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 py-2">
        <p className="text-[11px] text-ink-soft">
          合计{" "}
          <span
            className={cn(
              "font-mono font-semibold tabular-nums",
              totalSum === 0 ? "text-jade" : "text-vermilion"
            )}
          >
            {formatSignedScore(totalSum)}
          </span>
          <span className="text-ink-soft/60"> · 合计必须为 +0</span>
        </p>
        <div className="flex items-center gap-2">
          <Label htmlFor="record-round" className="text-xs">
            记录比赛历史
          </Label>
          <Switch
            id="record-round"
            checked={recordRound}
            onCheckedChange={onRecordRoundChange}
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1 px-3">
        <div className="space-y-2 py-1">
          <PotEntryRow
            pot={pot}
            potDelta={potDelta}
            onChange={onPotDeltaChange}
          />
          {orderedPlayers.map((p) => (
            <ScoreEntryRow
              key={p.id}
              player={p}
              delta={deltas[p.id] ?? 0}
              onChange={(n) => onDeltaChange(p.id, n)}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="shrink-0 space-y-2 px-3 pt-2 pb-2">
        {canUndo ? (
          <Button
            variant="outline"
            className="w-full border-vermilion/25 text-vermilion"
            onClick={onUndo}
          >
            撤销上一轮
          </Button>
        ) : null}
        <Button size="lg" className="w-full" onClick={onSettle}>
          结算本轮
        </Button>
      </div>
    </div>
  );
}
