"use client";

import { HistoryIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Player, RoundRecord } from "@/lib/game/types";
import { RoundHistoryCard } from "./round-history-card";

export function RoundHistorySheet({
  rounds,
  players,
  onDeleteRound,
}: {
  rounds: RoundRecord[];
  players: Player[];
  onDeleteRound: (roundId: string) => void;
}) {
  if (rounds.length === 0) return null;

  return (
    <Sheet>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10 text-ink-soft"
            aria-label="比赛历史"
          />
        }
      >
        <HistoryIcon className="size-4" />
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="max-h-[75dvh] gap-0 rounded-t-md border-border/60 bg-paper p-0"
      >
        <SheetHeader className="gap-1 px-4 pt-4 pb-3">
          <SheetTitle className="font-display text-base">比赛历史</SheetTitle>
          <SheetDescription className="text-[11px] text-ink-soft">
            删除比赛记录不会改动积分
          </SheetDescription>
        </SheetHeader>
        <ScrollArea className="h-[min(48dvh,420px)] px-3">
          <div className="space-y-2.5 pb-8">
            {rounds.map((round, index) => (
              <RoundHistoryCard
                key={round.id}
                round={round}
                roundNumber={rounds.length - index}
                players={players}
                onDelete={onDeleteRound}
              />
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
