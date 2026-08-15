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

function clampMin(n: number, min?: number) {
  if (min !== undefined && n < min) return min;
  return n;
}

export function NumberStepper({
  value,
  onChange,
  min,
  disabled,
  signed = true,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  disabled?: boolean;
  /** false = plain integer (e.g. multiplier), no leading + */
  signed?: boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const editing = draft !== null;
  const display = editing ? draft : formatIdle(value, signed);

  function commitDraft(raw: string) {
    const parsed = parseDraft(raw);
    setDraft(null);
    if (parsed === null) return;
    onChange(clampMin(parsed, min));
  }

  function step(next: number) {
    const clamped = clampMin(next, min);
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
        disabled={disabled || (min !== undefined && value <= min)}
        onClick={() => step(value - 1)}
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
          const next = clampMin(parsed, min);
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
        disabled={disabled}
        onClick={() => step(value + 1)}
        aria-label="增加"
      >
        <PlusIcon className="size-3.5" />
      </Button>
    </div>
  );
}
