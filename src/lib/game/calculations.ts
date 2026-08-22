import type { Player } from "./types";
import { formatSignedScore } from "./format-signed-score";

type ActionCheck =
  | { ok: true }
  | { ok: false; error: string };

type RoundDeltaCheck =
  | { ok: true; normalized: Record<string, number> }
  | { ok: false; error: string };

type AutoSplitResult =
  | {
      ok: true;
      scores: Record<string, number>;
      message: string;
    }
  | { ok: false; error: string };

/** 本轮加减分草稿校验（UI 开确认框与 applyRound 共用） */
export function validateRoundDeltas(
  players: Player[],
  pot: number,
  deltas: Record<string, number>,
  potDelta: number
): RoundDeltaCheck {
  if (players.length === 0) {
    return { ok: false, error: "请先新增玩家" };
  }
  if (!Number.isInteger(potDelta)) {
    return { ok: false, error: "抽水池变动必须是整数" };
  }
  if (pot + potDelta < 0) {
    return { ok: false, error: "抽水池结算后余额不能低于 +0" };
  }

  const normalized: Record<string, number> = {};
  let playerSum = 0;
  for (const p of players) {
    const d = deltas[p.id] ?? 0;
    if (!Number.isInteger(d)) {
      return { ok: false, error: "积分变动必须是整数" };
    }
    normalized[p.id] = d;
    playerSum += d;
  }

  const total = playerSum + potDelta;
  if (total !== 0) {
    return {
      ok: false,
      error: `加减分合计必须为 +0（当前为 ${formatSignedScore(total)}）`,
    };
  }

  const hasChange =
    potDelta !== 0 || Object.values(normalized).some((v) => v !== 0);
  if (!hasChange) {
    return { ok: false, error: "本轮没有任何积分变动" };
  }

  return { ok: true, normalized };
}

/** 手动分抽水池分配校验 */
export function validateManualAlloc(
  players: Player[],
  pot: number,
  allocations: Record<string, number>
): ActionCheck {
  if (pot < 1) {
    return { ok: false, error: "抽水池没有可分配的积分" };
  }

  let total = 0;
  for (const p of players) {
    const v = allocations[p.id] ?? 0;
    if (!Number.isInteger(v) || v < 0) {
      return { ok: false, error: "每人分配须为非负整数" };
    }
    total += v;
  }

  if (total !== pot) {
    return {
      ok: false,
      error: `分配总和须等于抽水池（抽水池内 ${formatSignedScore(pot)}，当前合计 ${formatSignedScore(total)}）`,
    };
  }

  return { ok: true };
}

/**
 * 先均分，余数按「当前分更低优先」每人 +1。
 * e.g. 39 分 4 人 → 每人 9，余 3 分给分最低的 3 人各 1 分。
 * 同分时按 id 稳定排序，保证余数总能分完。
 */
export function autoSplitPot(
  players: Player[],
  pot: number
): AutoSplitResult {
  if (pot < 1) {
    return { ok: false, error: "抽水池没有可分配的积分" };
  }

  const seated = players.filter((p) => p.atTable);
  if (seated.length === 0) {
    return { ok: false, error: "请先把至少一名玩家标成在座，才能自动分抽水池" };
  }

  const base = Math.floor(pot / seated.length);
  const remainder = pot % seated.length;

  const scores: Record<string, number> = Object.fromEntries(
    players.map((p) => [p.id, p.score])
  );

  for (const p of seated) {
    scores[p.id] += base;
  }

  const ranked = seated
    .map((p) => ({ id: p.id, score: scores[p.id] }))
    .sort((a, b) => a.score - b.score || a.id.localeCompare(b.id));

  for (let i = 0; i < remainder; i += 1) {
    scores[ranked[i].id] += 1;
  }

  return {
    ok: true,
    scores,
    message:
      remainder > 0
        ? `自动分抽水池：在座玩家每人 +${base}，余 +${remainder} 分已补给分较低的 ${remainder} 人`
        : `自动分抽水池：在座玩家每人 +${base}`,
  };
}

export function applyScores(
  players: Player[],
  scores: Record<string, number>
): Player[] {
  return players.map((p) => ({
    ...p,
    score: scores[p.id] ?? p.score,
  }));
}

export function multiplyScores(players: Player[], factor: number): Player[] {
  return players.map((p) => ({
    ...p,
    score: p.score * factor,
  }));
}
