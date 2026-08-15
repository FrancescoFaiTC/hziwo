"use client";

import type { Player } from "@/lib/game/types";
import { BenchPlayerChip } from "./bench-player-chip";

export function BenchSection({ bench }: { bench: Player[] }) {
  if (bench.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-0.5">
        <span className="text-[10px] font-medium tracking-[0.2em] text-ink-soft">
          候补玩家
        </span>
        <span className="soft-divider h-px flex-1" />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {bench.map((p) => (
          <BenchPlayerChip key={p.id} player={p} />
        ))}
      </div>
    </div>
  );
}
