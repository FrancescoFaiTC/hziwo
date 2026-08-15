"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { MAX_AT_TABLE, type Player } from "@/lib/game/types";
import type { GameApi } from "@/lib/game/use-game-state";
import { PlayerSeatRow } from "./player-seat-row";
import { AddPlayerForm } from "./add-player-form";

export function TableTab({
  isPlaying,
  players,
  seatedCount,
  name,
  initialScore,
  onNameChange,
  onInitialScoreChange,
  onToggleAtTable,
  onAddPlayer,
}: {
  isPlaying: boolean;
  players: Player[];
  seatedCount: number;
  name: string;
  initialScore: number;
  onNameChange: (name: string) => void;
  onInitialScoreChange: (n: number) => void;
  onToggleAtTable: GameApi["toggleAtTable"];
  onAddPlayer: GameApi["addPlayer"];
}) {
  return (
    <ScrollArea className="min-h-0 flex-1 px-3">
      <div className="space-y-3 py-2">
        <p className="text-xs leading-relaxed text-ink-soft">
          在座最多 {MAX_AT_TABLE} 名玩家；满座后新玩家默认候补。
        </p>
        {players.map((p) => (
          <PlayerSeatRow key={p.id} player={p} onToggle={onToggleAtTable} />
        ))}

        {isPlaying ? (
          <AddPlayerForm
            name={name}
            initialScore={initialScore}
            seatedCount={seatedCount}
            onNameChange={onNameChange}
            onInitialScoreChange={onInitialScoreChange}
            onAdd={onAddPlayer}
          />
        ) : (
          <p className="text-xs text-ink-soft">结算中不能新增玩家。</p>
        )}
      </div>
    </ScrollArea>
  );
}
