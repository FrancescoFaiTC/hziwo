"use client";

import { cn } from "@/lib/utils";
import type { Player } from "@/lib/game/types";
import { SeatedPlayerCard } from "./seated-player-card";

export function SeatedSection({ seated }: { seated: Player[] }) {
  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-0.5">
        <span className="text-[10px] font-medium tracking-[0.2em] text-vermilion">
          在座玩家
        </span>
        <span className="soft-divider h-px flex-1" />
      </div>
      {seated.length === 0 ? (
        <p className="py-3 text-center text-xs text-ink-soft">暂无在座玩家</p>
      ) : (
        <div
          className={cn(
            "grid gap-2",
            seated.length === 1 && "grid-cols-1",
            seated.length === 2 && "grid-cols-2",
            seated.length === 3 && "grid-cols-3",
            seated.length >= 4 && "grid-cols-4"
          )}
        >
          {seated.map((p, i) => (
            <SeatedPlayerCard key={p.id} player={p} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
