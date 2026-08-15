export type Phase = "playing" | "endgame";

export type Player = {
  id: string;
  name: string;
  initialScore: number;
  score: number;
  atTable: boolean;
};

export type RoundRecord = {
  id: string;
  /** 各玩家加减分 */
  deltas: Record<string, number>;
  /** 抽水池本轮加减分（与玩家 deltas 合计须为 0） */
  potDelta: number;
  createdAt: number;
};

export type ScoreSnapshot = {
  players: Player[];
  pot: number;
};

/** 上一轮结算快照，用于整轮撤销 */
export type LastRoundUndo = {
  before: ScoreSnapshot;
  recordedRoundId: string | null;
};

export type GameState = {
  version: 1;
  phase: Phase;
  players: Player[];
  pot: number;
  rounds: RoundRecord[];
  lastRoundUndo: LastRoundUndo | null;
  beforePotSplit: ScoreSnapshot | null;
  beforeMultiply: ScoreSnapshot | null;
  lastMultiplier: number | null;
};

export const STORAGE_KEY = "hziwo-mahjong-game-v1";

/** 牌桌在座玩家上限（自动分抽水池对象） */
export const MAX_AT_TABLE = 4;

export function createInitialState(): GameState {
  return {
    version: 1,
    phase: "playing",
    players: [],
    pot: 0,
    rounds: [],
    lastRoundUndo: null,
    beforePotSplit: null,
    beforeMultiply: null,
    lastMultiplier: null,
  };
}
