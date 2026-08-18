"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatSignedScore } from "@/lib/game/format-signed-score";

function formatIdle(value: number, signed: boolean) {
  return signed ? formatSignedScore(value) : String(value);
}

function isDraftAllowed(raw: string, signed: boolean) {
  if (raw === "") return true;
  if (signed && (raw === "-" || raw === "+")) return true;
  return signed ? /^[+-]?\d+$/.test(raw) : /^\d+$/.test(raw);
}

function parseDraft(raw: string): number | null {
  if (raw === "" || raw === "-" || raw === "+") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function clampRange(n: number, min?: number, max?: number) {
  let next = n;
  if (min !== undefined && next < min) next = min;
  if (max !== undefined && next > max) next = max;
  return next;
}

function snapToStep(n: number, min?: number, max?: number, step = 1) {
  let next = clampRange(n, min, max);
  if (step > 1) {
    const base = min ?? 0;
    next = Math.round((next - base) / step) * step + base;
    next = clampRange(next, min, max);
  }
  return next;
}

export function NumberStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  disabled,
  signed = true,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** false = plain integer (e.g. multiplier), no leading + */
  signed?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const editing = draft !== null;
  const display = editing ? draft : formatIdle(value, signed);
  const atMin = min !== undefined && value <= min;
  const atMax = max !== undefined && value >= max;

  function commitDraft(raw: string) {
    const parsed = parseDraft(raw);
    setDraft(null);
    if (parsed === null) return;
    onChange(snapToStep(parsed, min, max, step));
  }

  function stepBy(delta: number) {
    const clamped = snapToStep(value + delta, min, max, step);
    if (editing) setDraft(String(clamped));
    onChange(clamped);
  }

  return (
    <div className="flex h-11 shrink-0 items-center gap-1 touch-manipulation sm:h-9">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11 shrink-0 rounded-md bg-card/80 sm:size-9"
        disabled={disabled || atMin}
        onClick={() => stepBy(-step)}
        aria-label="减少"
      >
        <MinusIcon className="size-3.5" />
      </Button>
      <Input
        className="h-11 w-[4.25rem] rounded-md bg-card/90 px-1 py-0 text-center font-mono text-base font-medium leading-11 tabular-nums sm:h-9 sm:w-14 sm:leading-9"
        type="text"
        inputMode="numeric"
        autoComplete="off"
        enterKeyHint="done"
        disabled={disabled}
        value={display}
        onFocus={(e) => {
          setDraft(String(value));
          requestAnimationFrame(() => e.target.select());
        }}
        onChange={(e) => {
          const raw = signed
            ? e.target.value.replace(/[^\d+-]/g, "")
            : e.target.value.replace(/\D/g, "");
          if (!isDraftAllowed(raw, signed)) return;
          const parsed = parseDraft(raw);
          if (parsed === null) {
            setDraft(raw);
            return;
          }
          // 输入中低于 min 时先保留草稿（如从空打到 100），失焦再吸附
          if (min !== undefined && parsed < min) {
            setDraft(raw);
            return;
          }
          const next = max !== undefined ? Math.min(parsed, max) : parsed;
          setDraft(String(next));
          onChange(next);
        }}
        onBlur={() => {
          if (draft === null) return;
          commitDraft(draft);
        }}
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.currentTarget.blur();
        }}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-11 shrink-0 rounded-md bg-card/80 sm:size-9"
        disabled={disabled || atMax}
        onClick={() => stepBy(step)}
        aria-label="增加"
      >
        <PlusIcon className="size-3.5" />
      </Button>
    </div>
  );
}
