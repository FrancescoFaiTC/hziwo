"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Player, ScoreSnapshot } from "@/lib/game/types";
import type { GameApi } from "@/lib/game/use-game-state";
import { NumberStepper } from "@/components/mahjong/shared/number-stepper";
import {
  ScoreChangeConfirmDialog,
  type ScoreChangeRow,
} from "@/components/mahjong/shared/score-change-confirm-dialog";

export function MultiplyPanel({
  pot,
  players,
  multiplier,
  beforeMultiply,
  onMultiplierChange,
  onApply,
  onRollback,
}: {
  pot: number;
  players: Player[];
  multiplier: number;
  beforeMultiply: ScoreSnapshot | null;
  onMultiplierChange: (n: number) => void;
  onApply: GameApi["applyMultiplier"];
  onRollback: GameApi["rollbackMultiplier"];
}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [previewRows, setPreviewRows] = useState<ScoreChangeRow[]>([]);

  const canApply = !beforeMultiply && pot === 0;

  function openConfirm() {
    setPreviewRows(
      players
        .map((p) => ({
          id: p.id,
          label: p.name,
          from: p.score,
          to: p.score * multiplier,
        }))
        .filter((r) => r.from !== r.to)
    );
    setConfirmOpen(true);
  }

  function confirmMultiply() {
    const res = onApply(multiplier);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    toast.success(res.message);
    setConfirmOpen(false);
    return true;
  }

  return (
    <section className="panel space-y-3 rounded-md p-3.5">
      <div>
        <p className="font-display text-base">积分倍化</p>
        <p className="text-[11px] text-ink-soft">
          抽水池须为 +0 · 正整数
        </p>
      </div>
      <div className="flex items-center justify-between">
        <Label className="text-xs text-ink-soft">积分倍数</Label>
        <NumberStepper
          value={multiplier}
          min={1}
          signed={false}
          disabled={!!beforeMultiply || pot !== 0}
          onChange={onMultiplierChange}
        />
      </div>
      <div className="flex gap-2">
        <Button className="flex-1" disabled={!canApply} onClick={openConfirm}>
          积分倍化
        </Button>
        <Button
          className="flex-1"
          variant="outline"
          disabled={!beforeMultiply}
          onClick={() => {
            const res = onRollback();
            if (!res.ok) {
              toast.error(res.error);
              return;
            }
            toast.success(res.message);
          }}
        >
          回滚操作
        </Button>
      </div>

      <ScoreChangeConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="确认积分倍化"
        description="请核对积分倍率与积分变动，确认后再倍化。"
        confirmLabel="确认倍化"
        banner={`积分倍率 × ${multiplier}`}
        rows={previewRows}
        onConfirm={confirmMultiply}
      />
    </section>
  );
}
