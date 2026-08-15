"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { diffTone } from "@/components/mahjong/shared/diff-tone";
import { formatSignedScore } from "@/lib/game/format-signed-score";

export type ScoreChangeRow = {
  id: string;
  label: string;
  from: number;
  to: number;
  pot?: boolean;
};

export function ScoreChangeConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  banner,
  rows,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  banner?: string;
  rows: ScoreChangeRow[];
  /** 返回 false 表示未成功，允许再次点击 */
  onConfirm: () => boolean | void;
}) {
  const locked = useRef(false);

  useEffect(() => {
    if (open) locked.current = false;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-h-[85dvh] gap-3 overflow-hidden rounded-md sm:max-w-md"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="font-display">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {banner ? (
          <p className="rounded-md bg-mist/70 px-3 py-2 text-sm font-medium text-ink">
            {banner}
          </p>
        ) : null}

        <div className="max-h-[45dvh] space-y-2 overflow-y-auto">
          {rows.map((row) => {
            const delta = row.to - row.from;
            return (
              <div
                key={row.id}
                className={cn(
                  "flex items-center justify-between rounded-md px-3 py-2.5",
                  row.pot ? "pot-chip" : "bg-mist/70"
                )}
              >
                <span
                  className={cn(
                    "font-medium",
                    row.pot ? "text-vermilion" : undefined
                  )}
                >
                  {row.label}
                </span>
                <span
                  className={cn(
                    "font-mono text-sm font-semibold tabular-nums",
                    diffTone(delta)
                  )}
                >
                  {formatSignedScore(row.from)} → {formatSignedScore(row.to)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 pt-1">
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              if (locked.current) return;
              locked.current = true;
              const ok = onConfirm();
              if (ok === false) locked.current = false;
            }}
          >
            {confirmLabel}
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            返回
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
