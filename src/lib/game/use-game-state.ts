"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import {
  createInitialState,
  MAX_AT_TABLE,
  STORAGE_KEY,
  type GameState,
  type Player,
  type RoundRecord,
  type ScoreSnapshot,
} from "./types";
import {
  applyScores,
  autoSplitPot,
  multiplyScores,
  validateManualAlloc,
  validateRoundDeltas,
} from "./calculations";
import { createPlayerId } from "./create-player-id";

function snapshotOf(state: Pick<GameState, "players" | "pot">): ScoreSnapshot {
  return {
    players: state.players.map((p) => ({ ...p })),
    pot: state.pot,
  };
}

function isPlayer(value: unknown): value is Player {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Player>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    Number.isFinite(p.initialScore) &&
    Number.isFinite(p.score) &&
    typeof p.atTable === "boolean"
  );
}

function loadState(): GameState {
  if (typeof window === "undefined") return createInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<GameState>;
    if (parsed?.version !== 1) return createInitialState();

    const phase = parsed.phase === "endgame" ? "endgame" : "playing";
    const pot =
      typeof parsed.pot === "number" && Number.isInteger(parsed.pot)
        ? Math.max(0, parsed.pot)
        : 0;
    const players = Array.isArray(parsed.players)
      ? parsed.players.filter(isPlayer).map((p) => ({
          id: p.id,
          name: p.name,
          initialScore: Math.trunc(p.initialScore),
          score: Math.trunc(p.score),
          atTable: p.atTable,
        }))
      : [];

    return {
      ...createInitialState(),
      phase,
      pot,
      players,
      lastRoundUndo: parsed.lastRoundUndo ?? null,
      beforePotSplit: parsed.beforePotSplit ?? null,
      beforeMultiply: parsed.beforeMultiply ?? null,
      lastMultiplier:
        typeof parsed.lastMultiplier === "number" &&
        Number.isInteger(parsed.lastMultiplier)
          ? parsed.lastMultiplier
          : null,
      rounds: (parsed.rounds ?? []).map((r) => {
        const legacy = r as RoundRecord & { rakes?: Record<string, number> };
        return {
          id: legacy.id,
          deltas: legacy.deltas ?? {},
          createdAt: legacy.createdAt,
          potDelta:
            typeof legacy.potDelta === "number"
              ? legacy.potDelta
              : Object.values(legacy.rakes ?? {}).reduce((s, n) => s + n, 0),
        };
      }),
    };
  } catch {
    return createInitialState();
  }
}

type ActionResult =
  | { ok: true; message?: string; atTable?: boolean }
  | { ok: false; error: string };

export function useGameState() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [hydrated, setHydrated] = useState(false);

  useLayoutEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 固定站点 / 隐私模式等可能禁止写入，不应导致整页崩溃
    }
  }, [state, hydrated]);

  const addPlayer = useCallback(
    (name: string, initialScore: number): ActionResult => {
      const trimmed = name.trim();
      if (!trimmed) return { ok: false, error: "请填写玩家名字" };
      if (!Number.isInteger(initialScore)) {
        return { ok: false, error: "初始积分须为整数" };
      }

      let newId: string;
      try {
        newId = createPlayerId();
      } catch {
        return { ok: false, error: "无法创建玩家，请重试" };
      }

      let result: ActionResult = { ok: true };
      setState((prev) => {
        if (prev.phase !== "playing") {
          result = {
            ok: false,
            error: "结算中不能新增玩家，请先继续比赛",
          };
          return prev;
        }
        const seated = prev.players.filter((p) => p.atTable).length;
        const atTable = seated < MAX_AT_TABLE;
        result = { ok: true, atTable };
        return {
          ...prev,
          players: [
            ...prev.players,
            {
              id: newId,
              name: trimmed,
              initialScore,
              score: initialScore,
              atTable,
            },
          ],
        };
      });
      return result;
    },
    []
  );

  const toggleAtTable = useCallback((playerId: string): ActionResult => {
    let result: ActionResult = { ok: true };
    setState((prev) => {
      const target = prev.players.find((p) => p.id === playerId);
      if (!target) {
        result = { ok: false, error: "玩家不存在" };
        return prev;
      }
      if (!target.atTable) {
        const seated = prev.players.filter((p) => p.atTable).length;
        if (seated >= MAX_AT_TABLE) {
          result = {
            ok: false,
            error: `在座玩家最多 ${MAX_AT_TABLE} 名，请先让其他人离座`,
          };
          return prev;
        }
      }
      return {
        ...prev,
        players: prev.players.map((p) =>
          p.id === playerId ? { ...p, atTable: !p.atTable } : p
        ),
      };
    });
    return result;
  }, []);

  const applyRound = useCallback(
    (
      deltas: Record<string, number>,
      potDelta: number,
      record: boolean
    ): ActionResult => {
      let result: ActionResult = { ok: true, message: "本轮已记录" };
      setState((prev) => {
        if (prev.phase !== "playing") {
          result = { ok: false, error: "结算中不能记录本轮" };
          return prev;
        }
        const check = validateRoundDeltas(
          prev.players,
          prev.pot,
          deltas,
          potDelta
        );
        if (!check.ok) {
          result = check;
          return prev;
        }
        const { normalized } = check;
        const before = snapshotOf(prev);
        const roundId = record ? createPlayerId() : null;
        const players = prev.players.map((p) => ({
          ...p,
          score: p.score + (normalized[p.id] ?? 0),
        }));
        const rounds: RoundRecord[] =
          record && roundId
            ? [
                {
                  id: roundId,
                  deltas: normalized,
                  potDelta,
                  createdAt: Date.now(),
                },
                ...prev.rounds,
              ]
            : prev.rounds;

        return {
          ...prev,
          players,
          pot: prev.pot + potDelta,
          rounds,
          lastRoundUndo: {
            before,
            recordedRoundId: roundId,
          },
        };
      });
      return result;
    },
    []
  );

  const undoLastRound = useCallback((): ActionResult => {
    let result: ActionResult = { ok: true, message: "已撤销上一轮" };
    setState((prev) => {
      if (!prev.lastRoundUndo) {
        result = { ok: false, error: "没有可撤销的上一轮" };
        return prev;
      }
      if (prev.phase !== "playing") {
        result = { ok: false, error: "结算中不能撤销上一轮" };
        return prev;
      }
      const { before, recordedRoundId } = prev.lastRoundUndo;
      const scoreBefore = new Map(
        before.players.map((p) => [p.id, p.score] as const)
      );
      return {
        ...prev,
        // 只回滚积分与抽水池，保留之后新增的玩家与座位调整
        players: prev.players.map((p) =>
          scoreBefore.has(p.id)
            ? { ...p, score: scoreBefore.get(p.id)! }
            : p
        ),
        pot: before.pot,
        rounds: recordedRoundId
          ? prev.rounds.filter((r) => r.id !== recordedRoundId)
          : prev.rounds,
        lastRoundUndo: null,
      };
    });
    return result;
  }, []);

  const deleteRound = useCallback((roundId: string) => {
    setState((prev) => ({
      ...prev,
      rounds: prev.rounds.filter((r) => r.id !== roundId),
    }));
  }, []);

  const enterEndgame = useCallback((): ActionResult => {
    setState((prev) => ({ ...prev, phase: "endgame" }));
    return { ok: true };
  }, []);

  const returnToPlaying = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "playing",
      // 回到比赛后不允许再回滚结算期操作，避免覆盖后续轮次
      beforePotSplit: null,
      beforeMultiply: null,
    }));
  }, []);

  const manualSplitPot = useCallback(
    (allocations: Record<string, number>): ActionResult => {
      let result: ActionResult = { ok: true, message: "手动分抽水池完成" };
      setState((prev) => {
        if (prev.phase !== "endgame") {
          result = { ok: false, error: "请先进入结算" };
          return prev;
        }
        if (prev.beforeMultiply) {
          result = {
            ok: false,
            error: "积分已倍化，请先回滚积分倍化操作后再分抽水池",
          };
          return prev;
        }
        const check = validateManualAlloc(
          prev.players,
          prev.pot,
          allocations
        );
        if (!check.ok) {
          result = check;
          return prev;
        }
        const before = snapshotOf(prev);
        return {
          ...prev,
          beforePotSplit: before,
          beforeMultiply: null,
          lastMultiplier: null,
          lastRoundUndo: null,
          pot: 0,
          players: prev.players.map((p) => ({
            ...p,
            score: p.score + (allocations[p.id] ?? 0),
          })),
        };
      });
      return result;
    },
    []
  );

  const runAutoSplit = useCallback((): ActionResult => {
    let result: ActionResult = { ok: true };
    setState((prev) => {
      if (prev.phase !== "endgame") {
        result = { ok: false, error: "请先进入结算" };
        return prev;
      }
      if (prev.beforeMultiply) {
        result = {
          ok: false,
          error: "积分已倍化，请先回滚积分倍化操作后再分抽水池",
        };
        return prev;
      }
      const split = autoSplitPot(prev.players, prev.pot);
      if (!split.ok) {
        result = split;
        return prev;
      }
      const before = snapshotOf(prev);
      result = { ok: true, message: split.message };
      return {
        ...prev,
        beforePotSplit: before,
        beforeMultiply: null,
        lastMultiplier: null,
        lastRoundUndo: null,
        pot: 0,
        players: applyScores(prev.players, split.scores),
      };
    });
    return result;
  }, []);

  const rollbackPotSplit = useCallback((): ActionResult => {
    let result: ActionResult = { ok: true, message: "已回滚分抽水池操作" };
    setState((prev) => {
      if (!prev.beforePotSplit) {
        result = { ok: false, error: "没有可回滚的分抽水池操作" };
        return prev;
      }
      if (prev.beforeMultiply) {
        result = {
          ok: false,
          error: "请先回滚积分倍化操作，再回滚分抽水池操作",
        };
        return prev;
      }
      return {
        ...prev,
        players: prev.beforePotSplit.players.map((p) => ({ ...p })),
        pot: prev.beforePotSplit.pot,
        beforePotSplit: null,
      };
    });
    return result;
  }, []);

  const applyMultiplier = useCallback((factor: number): ActionResult => {
    let result: ActionResult = {
      ok: true,
      message: `已将所有人积分 ×${factor}`,
    };
    setState((prev) => {
      if (prev.phase !== "endgame") {
        result = { ok: false, error: "请先进入结算" };
        return prev;
      }
      if (prev.pot !== 0) {
        result = {
          ok: false,
          error: "抽水池必须为 +0 才能做积分倍化，请先把抽水池分完",
        };
        return prev;
      }
      if (!Number.isInteger(factor) || factor < 1) {
        result = { ok: false, error: "积分倍数须为正整数" };
        return prev;
      }
      if (prev.beforeMultiply) {
        result = {
          ok: false,
          error: "已经做过积分倍化了，要重做请先回滚操作",
        };
        return prev;
      }
      return {
        ...prev,
        beforeMultiply: snapshotOf(prev),
        lastMultiplier: factor,
        lastRoundUndo: null,
        players: multiplyScores(prev.players, factor),
      };
    });
    return result;
  }, []);

  const rollbackMultiplier = useCallback((): ActionResult => {
    let result: ActionResult = { ok: true, message: "已回滚积分倍化操作" };
    setState((prev) => {
      if (!prev.beforeMultiply) {
        result = { ok: false, error: "没有可回滚的积分倍化操作" };
        return prev;
      }
      return {
        ...prev,
        players: prev.beforeMultiply.players.map((p) => ({ ...p })),
        pot: prev.beforeMultiply.pot,
        beforeMultiply: null,
        lastMultiplier: null,
      };
    });
    return result;
  }, []);

  const resetGame = useCallback(() => {
    setState(createInitialState());
  }, []);

  return {
    state,
    hydrated,
    addPlayer,
    toggleAtTable,
    applyRound,
    undoLastRound,
    deleteRound,
    enterEndgame,
    returnToPlaying,
    manualSplitPot,
    runAutoSplit,
    rollbackPotSplit,
    applyMultiplier,
    rollbackMultiplier,
    resetGame,
  };
}

export type GameApi = ReturnType<typeof useGameState>;
