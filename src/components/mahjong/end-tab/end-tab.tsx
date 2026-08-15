"use client";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { Player } from "@/lib/game/types";
import type { GameApi } from "@/lib/game/use-game-state";
import { PotSplitPanel } from "./pot-split-panel";
import { MultiplyPanel } from "./multiply-panel";

export function EndTab({
  isPlaying,
  isEndgame,
  pot,
  players,
  manualAlloc,
  manualSum,
  multiplier,
  beforePotSplit,
  beforeMultiply,
  onEnterEndgame,
  onReturnToPlaying,
  onOpenReset,
  onManualAllocChange,
  onClearManualAlloc,
  onMultiplierChange,
  onAutoSplit,
  onRollbackPotSplit,
  onManualSplitPot,
  onApplyMultiplier,
  onRollbackMultiplier,
}: {
  isPlaying: boolean;
  isEndgame: boolean;
  pot: number;
  players: Player[];
  manualAlloc: Record<string, number>;
  manualSum: number;
  multiplier: number;
  beforePotSplit: unknown;
  beforeMultiply: unknown;
  onEnterEndgame: GameApi["enterEndgame"];
  onReturnToPlaying: GameApi["returnToPlaying"];
  onOpenReset: () => void;
  onManualAllocChange: (playerId: string, n: number) => void;
  onClearManualAlloc: () => void;
  onMultiplierChange: (n: number) => void;
  onAutoSplit: GameApi["runAutoSplit"];
  onRollbackPotSplit: GameApi["rollbackPotSplit"];
  onManualSplitPot: GameApi["manualSplitPot"];
  onApplyMultiplier: GameApi["applyMultiplier"];
  onRollbackMultiplier: GameApi["rollbackMultiplier"];
}) {
  return (
    <ScrollArea className="min-h-0 flex-1 px-3">
      <div className="space-y-4 py-2">
        <div className="flex gap-2">
          {isPlaying ? (
            <Button
              className="flex-1"
              size="lg"
              onClick={() => {
                onEnterEndgame();
                toast.message("已进入结算");
              }}
            >
              进入结算
            </Button>
          ) : (
            <Button
              className="flex-1"
              size="lg"
              variant="secondary"
              onClick={() => {
                onReturnToPlaying();
                toast.message("已继续比赛");
              }}
            >
              继续比赛
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            className="flex-1 border-vermilion/30 text-vermilion"
            onClick={onOpenReset}
          >
            重新开始
          </Button>
        </div>

        {!isEndgame ? (
          <div className="rounded-md bg-mist/60 px-4 py-8 text-center">
            <p className="font-display text-base text-ink/80">还没开始结算</p>
            <p className="mt-1 text-xs text-ink-soft">
              分抽水池和积分倍化，只有进入结算之后才能用
            </p>
          </div>
        ) : (
          <>
            <PotSplitPanel
              pot={pot}
              players={players}
              manualAlloc={manualAlloc}
              manualSum={manualSum}
              beforePotSplit={beforePotSplit}
              beforeMultiply={beforeMultiply}
              onManualAllocChange={onManualAllocChange}
              onClearManualAlloc={onClearManualAlloc}
              onAutoSplit={onAutoSplit}
              onRollback={onRollbackPotSplit}
              onManualConfirm={onManualSplitPot}
            />
            <MultiplyPanel
              pot={pot}
              players={players}
              multiplier={multiplier}
              beforeMultiply={beforeMultiply}
              onMultiplierChange={onMultiplierChange}
              onApply={onApplyMultiplier}
              onRollback={onRollbackMultiplier}
            />
          </>
        )}
      </div>
    </ScrollArea>
  );
}
