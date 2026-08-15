"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MAX_AT_TABLE } from "@/lib/game/types";
import type { GameApi } from "@/lib/game/use-game-state";
import { NumberStepper } from "@/components/mahjong/shared/number-stepper";

export function AddPlayerForm({
  name,
  initialScore,
  seatedCount,
  onNameChange,
  onInitialScoreChange,
  onAdd,
}: {
  name: string;
  initialScore: number;
  seatedCount: number;
  onNameChange: (name: string) => void;
  onInitialScoreChange: (n: number) => void;
  onAdd: GameApi["addPlayer"];
}) {
  return (
    <div className="seat-chip space-y-3 rounded-md p-3.5">
      <p className="text-sm font-medium">新增玩家</p>
      <Input
        placeholder="名字"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        className="h-11 bg-card"
      />
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-ink-soft">初始积分</Label>
        <NumberStepper value={initialScore} onChange={onInitialScoreChange} />
      </div>
      <Button
        className="w-full"
        onClick={() => {
          const res = onAdd(name, initialScore);
          if (!res.ok) {
            toast.error(res.error);
            return;
          }
          toast.success(
            seatedCount < MAX_AT_TABLE
              ? `${name.trim()} 已成为在座玩家`
              : `${name.trim()} 已成为候补玩家`
          );
          onNameChange("");
          onInitialScoreChange(0);
        }}
      >
        新增
      </Button>
    </div>
  );
}
