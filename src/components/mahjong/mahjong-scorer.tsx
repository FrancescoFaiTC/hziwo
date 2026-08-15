"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Tabs, TabsContent } from "@/components/ui/tabs";
import type { GameApi } from "@/lib/game/use-game-state";
import { AppHeader } from "@/components/mahjong/header/app-header";
import { ScoreStage } from "@/components/mahjong/score-stage/score-stage";
import { RoundTab } from "@/components/mahjong/round-tab/round-tab";
import { TableTab } from "@/components/mahjong/table-tab/table-tab";
import { EndTab } from "@/components/mahjong/end-tab/end-tab";
import { ResetGameDialog } from "@/components/mahjong/end-tab/reset-game-dialog";
import { BottomTabs, type TabId } from "@/components/mahjong/bottom-tabs";
import { validateRoundDeltas } from "@/lib/game/calculations";
import {
  ScoreChangeConfirmDialog,
  type ScoreChangeRow,
} from "@/components/mahjong/shared/score-change-confirm-dialog";

export function MahjongScorer({ game }: { game: GameApi }) {
  const { state, hydrated } = game;
  const isPlaying = state.phase === "playing";
  const isEndgame = state.phase === "endgame";
  const seatedCount = state.players.filter((p) => p.atTable).length;
  const seated = state.players.filter((p) => p.atTable);
  const bench = state.players.filter((p) => !p.atTable);

  const [tab, setTab] = useState<TabId>("round");
  const [name, setName] = useState("");
  const [initialScore, setInitialScore] = useState(0);
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const [potDelta, setPotDelta] = useState(0);
  const [recordRound, setRecordRound] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [manualAlloc, setManualAlloc] = useState<Record<string, number>>({});
  const [multiplier, setMultiplier] = useState(2);
  const [resetOpen, setResetOpen] = useState(false);

  const totalSum = useMemo(
    () =>
      potDelta + state.players.reduce((s, p) => s + (deltas[p.id] ?? 0), 0),
    [state.players, deltas, potDelta]
  );

  const manualSum = useMemo(
    () => state.players.reduce((s, p) => s + (manualAlloc[p.id] ?? 0), 0),
    [state.players, manualAlloc]
  );

  const settleRows = useMemo((): ScoreChangeRow[] => {
    const rows: ScoreChangeRow[] = [];
    if (potDelta !== 0) {
      rows.push({
        id: "pot",
        label: "抽水池",
        from: state.pot,
        to: state.pot + potDelta,
        pot: true,
      });
    }
    for (const p of state.players) {
      if (!p.atTable) continue;
      const d = deltas[p.id] ?? 0;
      if (d === 0) continue;
      rows.push({
        id: p.id,
        label: p.name,
        from: p.score,
        to: p.score + d,
      });
    }
    for (const p of state.players) {
      if (p.atTable) continue;
      const d = deltas[p.id] ?? 0;
      if (d === 0) continue;
      rows.push({
        id: p.id,
        label: p.name,
        from: p.score,
        to: p.score + d,
      });
    }
    return rows;
  }, [state.pot, state.players, potDelta, deltas]);

  function openConfirm() {
    const check = validateRoundDeltas(
      state.players,
      state.pot,
      deltas,
      potDelta
    );
    if (!check.ok) {
      toast.error(check.error);
      return;
    }
    setConfirmOpen(true);
  }

  function confirmSettle() {
    const res = game.applyRound(deltas, potDelta, recordRound);
    if (!res.ok) {
      toast.error(res.error);
      return false;
    }
    setConfirmOpen(false);
    setDeltas({});
    setPotDelta(0);
    toast.success(res.message ?? "本轮已记录");
    return true;
  }

  function undoLastRound() {
    const res = game.undoLastRound();
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    toast.message(res.message);
  }

  if (!hydrated) {
    return (
      <div className="app-shell flex h-dvh items-center justify-center">
        <span className="font-display text-xl tracking-[0.35em] text-ink/40">
          红中
        </span>
      </div>
    );
  }

  return (
    <div className="app-shell mx-auto flex h-full max-h-dvh w-full max-w-lg flex-col overflow-hidden md:max-w-2xl">
      <AppHeader
        isEndgame={isEndgame}
        seatedCount={seatedCount}
        lastMultiplier={state.lastMultiplier}
        pot={state.pot}
        rounds={state.rounds}
        players={state.players}
        onDeleteRound={game.deleteRound}
      />

      <ScoreStage
        players={state.players}
        seated={seated}
        bench={bench}
      />

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as TabId)}
        className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden"
      >
        <div className="min-h-0 flex-1 overflow-hidden px-1">
          <TabsContent
            value="round"
            className="flex h-full min-h-0 flex-col data-[hidden]:hidden"
          >
            <RoundTab
              isPlaying={isPlaying}
              players={state.players}
              pot={state.pot}
              potDelta={potDelta}
              deltas={deltas}
              totalSum={totalSum}
              recordRound={recordRound}
              canUndo={!!state.lastRoundUndo}
              onPotDeltaChange={setPotDelta}
              onDeltaChange={(playerId, n) =>
                setDeltas((prev) => ({ ...prev, [playerId]: n }))
              }
              onRecordRoundChange={setRecordRound}
              onUndo={undoLastRound}
              onSettle={openConfirm}
              onGoEnd={() => setTab("end")}
              onGoTable={() => setTab("table")}
            />
          </TabsContent>

          <TabsContent
            value="table"
            className="flex h-full min-h-0 flex-col data-[hidden]:hidden"
          >
            <TableTab
              isPlaying={isPlaying}
              players={state.players}
              seatedCount={seatedCount}
              name={name}
              initialScore={initialScore}
              onNameChange={setName}
              onInitialScoreChange={setInitialScore}
              onToggleAtTable={game.toggleAtTable}
              onAddPlayer={game.addPlayer}
            />
          </TabsContent>

          <TabsContent
            value="end"
            className="flex h-full min-h-0 flex-col data-[hidden]:hidden"
          >
            <EndTab
              isPlaying={isPlaying}
              isEndgame={isEndgame}
              pot={state.pot}
              players={state.players}
              manualAlloc={manualAlloc}
              manualSum={manualSum}
              multiplier={multiplier}
              beforePotSplit={state.beforePotSplit}
              beforeMultiply={state.beforeMultiply}
              onEnterEndgame={game.enterEndgame}
              onReturnToPlaying={game.returnToPlaying}
              onOpenReset={() => setResetOpen(true)}
              onManualAllocChange={(playerId, n) =>
                setManualAlloc((prev) => ({ ...prev, [playerId]: n }))
              }
              onClearManualAlloc={() => setManualAlloc({})}
              onMultiplierChange={setMultiplier}
              onAutoSplit={game.runAutoSplit}
              onRollbackPotSplit={game.rollbackPotSplit}
              onManualSplitPot={game.manualSplitPot}
              onApplyMultiplier={game.applyMultiplier}
              onRollbackMultiplier={game.rollbackMultiplier}
            />
          </TabsContent>
        </div>

        <BottomTabs />
      </Tabs>

      <ScoreChangeConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="确认本轮结算"
        description="请核对积分变动，确认后一起结算。"
        confirmLabel="确认结算"
        rows={settleRows}
        onConfirm={confirmSettle}
      />

      <ResetGameDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        onConfirm={() => {
          game.resetGame();
          setDeltas({});
          setPotDelta(0);
          setManualAlloc({});
          setName("");
          setInitialScore(0);
          setMultiplier(2);
          setTab("round");
          setResetOpen(false);
          toast.success("已重新开始");
        }}
      />
    </div>
  );
}
