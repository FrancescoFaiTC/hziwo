"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { Player, ScoreSnapshot } from "@/lib/game/types";
import type { GameApi } from "@/lib/game/use-game-state";
import { autoSplitPot, validateManualAlloc } from "@/lib/game/calculations";
import { NumberStepper } from "@/components/mahjong/shared/number-stepper";
import { formatSignedScore } from "@/lib/game/format-signed-score";
import {
  ScoreChangeConfirmDialog,
  type ScoreChangeRow,
} from "@/components/mahjong/shared/score-change-confirm-dialog";

function potSplitRows(
  players: Player[],
  pot: number,
  nextScores: Record<string, number>
): ScoreChangeRow[] {
  return [
    {
      id: "pot",
      label: "抽水池",
      from: pot,
      to: 0,
      pot: true,
    },
    ...players
      .map((p) => ({
        id: p.id,
        label: p.name,
        from: p.score,
        to: nextScores[p.id] ?? p.score,
      }))
      .filter((r) => r.from !== r.to),
  ];
}

export function PotSplitPanel({
  pot,
  players,
  manualAlloc,
  manualSum,
  beforePotSplit,
  beforeMultiply,
  onManualAllocChange,
  onClearManualAlloc,
  onAutoSplit,
  onRollback,
  onManualConfirm,
}: {
  pot: number;
  players: Player[];
  manualAlloc: Record<string, number>;
  manualSum: number;
  beforePotSplit: ScoreSnapshot | null;
  beforeMultiply: ScoreSnapshot | null;
  onManualAllocChange: (playerId: string, n: number) => void;
  onClearManualAlloc: () => void;
  onAutoSplit: GameApi["runAutoSplit"];
  onRollback: GameApi["rollbackPotSplit"];
  onManualConfirm: GameApi["manualSplitPot"];
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMode, setConfirmMode] = useState<"auto" | "manual" | null>(
    null
  );
  const [previewRows, setPreviewRows] = useState<ScoreChangeRow[]>([]);

  const busy = !!beforeMultiply || pot < 1;

  function openAutoConfirm() {
    const result = autoSplitPot(players, pot);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setPreviewRows(potSplitRows(players, pot, result.scores));
    setConfirmMode("auto");
    setConfirmOpen(true);
  }

  function openManualConfirm() {
    const check = validateManualAlloc(players, pot, manualAlloc);
    if (!check.ok) {
      toast.error(check.error);
      return;
    }
    const nextScores = Object.fromEntries(
      players.map((p) => [p.id, p.score + (manualAlloc[p.id] ?? 0)])
    );
    setPreviewRows(potSplitRows(players, pot, nextScores));
    setConfirmMode("manual");
    setConfirmOpen(true);
  }

  function confirmSplit() {
    if (confirmMode === "auto") {
      const res = onAutoSplit();
      if (!res.ok) {
        toast.error(res.error);
        return false;
      }
      toast.success(res.message ?? "自动分抽水池完成");
      onClearManualAlloc();
    } else if (confirmMode === "manual") {
      const res = onManualConfirm(manualAlloc);
      if (!res.ok) {
        toast.error(res.error);
        return false;
      }
      toast.success(res.message);
      onClearManualAlloc();
    } else {
      return false;
    }
    setConfirmOpen(false);
    setConfirmMode(null);
    return true;
  }

  const title =
    confirmMode === "auto"
      ? "确认自动分抽水池"
      : confirmMode === "manual"
        ? "确认手动分抽水池"
        : "确认分抽水池";

  return (
    <section className="panel space-y-3 rounded-md p-3.5">
      <div className="flex items-end justify-between">
        <div>
          <p className="font-display text-base">分抽水池</p>
          <p className="text-[11px] text-ink-soft">
            自动只分给在座玩家
          </p>
        </div>
        <p className="font-mono text-lg font-semibold tabular-nums text-vermilion">
          {formatSignedScore(pot)}
        </p>
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" disabled={busy} onClick={openAutoConfirm}>
          自动分抽水池
        </Button>
        <Button
          className="flex-1"
          variant="outline"
          disabled={!beforePotSplit || !!beforeMultiply}
          onClick={() => {
            const res = onRollback();
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            toast.success(res.message);
            onClearManualAlloc();
          }}
        >
          回滚操作
        </Button>
      </div>
      <p className="text-xs text-ink-soft">
        手动分抽水池 · {formatSignedScore(manualSum)}/
        {formatSignedScore(pot)}
      </p>
      {players.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-2">
          <span className="min-w-14 truncate text-sm">{p.name}</span>
          <NumberStepper
            value={manualAlloc[p.id] ?? 0}
            min={0}
            disabled={busy}
            onChange={(n) => onManualAllocChange(p.id, n)}
          />
        </div>
      ))}
      <Button
        className="w-full"
        variant="secondary"
        disabled={busy}
        onClick={openManualConfirm}
      >
        确认手动分抽水池
      </Button>

      <ScoreChangeConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={title}
        description="请核对积分变动，确认后再分抽水池。"
        confirmLabel="确认分配"
        rows={previewRows}
        onConfirm={confirmSplit}
      />
    </section>
  );
}
