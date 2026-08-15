"use client";

import { NumberStepper } from "@/components/mahjong/shared/number-stepper";
import { formatSignedScore } from "@/lib/game/format-signed-score";

export function PotEntryRow({
  pot,
  potDelta,
  onChange,
}: {
  pot: number;
  potDelta: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="pot-chip flex items-center gap-3 rounded-md px-3 py-2.5">
      <div className="flex h-9 min-w-0 flex-1 items-center gap-2 overflow-hidden pl-1.5 text-sm leading-none text-vermilion">
        <span className="truncate font-medium">抽水池</span>
        <span className="inline-flex h-3.5 shrink-0 items-center">
          <span className="text-xs leading-none tabular-nums text-vermilion/70">
            {formatSignedScore(pot)}
          </span>
        </span>
      </div>
      <NumberStepper
        value={potDelta}
        min={-pot}
        onChange={onChange}
      />
    </div>
  );
}
