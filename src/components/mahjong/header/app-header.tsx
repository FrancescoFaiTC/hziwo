"use client";

import { MAX_AT_TABLE, type Player, type RoundRecord } from "@/lib/game/types";
import { PotBadge } from "./pot-badge";
import { RoundHistorySheet } from "./round-history-sheet";

export function AppHeader({
  isEndgame,
  seatedCount,
  lastMultiplier,
  pot,
  rounds,
  players,
  onDeleteRound,
}: {
  isEndgame: boolean;
  seatedCount: number;
  lastMultiplier: number | null;
  pot: number;
  rounds: RoundRecord[];
  players: Player[];
  onDeleteRound: (roundId: string) => void;
}) {
  return (
    <header className="shrink-0 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="animate-fade flex items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-[1.5rem] leading-none font-bold tracking-[0.18em] text-ink">
            红中
          </h1>
          <p className="mt-1.5 text-[11px] tracking-wide text-ink-soft">
            {isEndgame ? "结算中" : "比赛中"}
            {" · "}在座玩家 {seatedCount}/{MAX_AT_TABLE}
            {" · "}
            <span
              className={
                lastMultiplier && lastMultiplier !== 1
                  ? "text-vermilion"
                  : undefined
              }
            >
              积分倍率 × {lastMultiplier ?? 1}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RoundHistorySheet
            rounds={rounds}
            players={players}
            onDeleteRound={onDeleteRound}
          />
          <PotBadge pot={pot} />
        </div>
      </div>
    </header>
  );
}
