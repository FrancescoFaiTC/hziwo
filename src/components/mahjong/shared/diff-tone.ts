export function diffTone(diff: number) {
  if (diff > 0) return "text-vermilion";
  if (diff < 0) return "text-jade";
  return "text-ink-soft";
}
