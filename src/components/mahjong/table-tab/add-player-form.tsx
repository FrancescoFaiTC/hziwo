"use client";

import { type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { GameApi } from "@/lib/game/use-game-state";
import { NumberStepper } from "@/components/mahjong/shared/number-stepper";

function readPlayerName(form: HTMLFormElement) {
  const input = form.elements.namedItem("playerName");
  return input instanceof HTMLInputElement ? input.value : "";
}

export function AddPlayerForm({
  name,
  initialScore,
  onNameChange,
  onInitialScoreChange,
  onAdd,
}: {
  name: string;
  initialScore: number;
  onNameChange: (name: string) => void;
  onInitialScoreChange: (n: number) => void;
  onAdd: GameApi["addPlayer"];
}) {
  function submitAdd(form: HTMLFormElement) {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    const submittedName = readPlayerName(form);
    const res = onAdd(submittedName, initialScore);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }

    const trimmed = submittedName.trim();
    toast.success(
      res.atTable
        ? `${trimmed} 已成为在座玩家`
        : `${trimmed} 已成为候补玩家`
    );
    onNameChange("");
    onInitialScoreChange(0);
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submitAdd(e.currentTarget);
  }

  return (
    <form
      className="seat-chip space-y-3 rounded-md p-3.5"
      action="#"
      onSubmit={handleSubmit}
    >
      <p className="text-sm font-medium">新增玩家</p>
      <Input
        name="playerName"
        placeholder="名字"
        value={name}
        enterKeyHint="done"
        autoComplete="off"
        onChange={(e) => onNameChange(e.target.value)}
        className="h-11 bg-card"
      />
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs text-ink-soft">初始积分</Label>
        <NumberStepper value={initialScore} onChange={onInitialScoreChange} />
      </div>
      <Button
        type="button"
        className="w-full"
        onClick={(e) => {
          const form = e.currentTarget.form;
          if (form) submitAdd(form);
        }}
      >
        新增
      </Button>
    </form>
  );
}
