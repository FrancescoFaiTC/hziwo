"use client";

import { MahjongScorer } from "@/components/mahjong/mahjong-scorer";
import { useGameState } from "@/lib/game/use-game-state";

export default function Home() {
  const game = useGameState();
  return <MahjongScorer game={game} />;
}
