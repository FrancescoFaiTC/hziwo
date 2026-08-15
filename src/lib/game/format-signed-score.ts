/** 积分相关数字：0 与正数带 +，负数带 - */
export function formatSignedScore(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`;
}
