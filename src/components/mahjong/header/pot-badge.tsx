"use client";

import { formatSignedScore } from "@/lib/game/format-signed-score";

export function PotBadge({ pot }: { pot: number }) {
  return (
    <div className="pot-chip flex h-10 items-center gap-2 rounded-md px-2.5">
      <span className="text-[11px] font-medium text-vermilion">抽水池</span>
      <span className="font-mono text-sm font-semibold tabular-nums text-vermilion">
        {formatSignedScore(pot)}
      </span>
    </div>
  );
}
