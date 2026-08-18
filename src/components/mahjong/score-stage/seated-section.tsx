"use client";

import { MAX_AT_TABLE, type Player } from "@/lib/game/types";
import { SeatedPlayerCard } from "./seated-player-card";

function EmptySeat({ index }: { index: number }) {
  return (
    <div
      className="animate-rise flex h-[4.5rem] flex-col items-center justify-center rounded-md border border-dashed border-ink/12 bg-paper/40"
      style={{ animationDelay: `${index * 40}ms` }}
      aria-label={`空位 ${index + 1}`}
    >
      <span className="text-[10px] tracking-wide text-ink-soft/65">空位</span>
    </div>
  );
}

export function SeatedSection({ seated }: { seated: Player[] }) {
  const slots = Array.from(
    { length: MAX_AT_TABLE },
    (_, i) => seated[i] ?? null
  );

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 px-0.5">
        <span className="text-[10px] font-medium tracking-[0.2em] text-vermilion">
          在座玩家
        </span>
        <span className="text-[10px] tabular-nums text-ink-soft">
          {seated.length}/{MAX_AT_TABLE}
        </span>
        <span className="soft-divider h-px flex-1" />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {slots.map((player, i) =>
          player ? (
            <SeatedPlayerCard key={player.id} player={player} index={i} />
          ) : (
            <EmptySeat key={`empty-${i}`} index={i} />
          )
        )}
      </div>
    </div>
  );
}
