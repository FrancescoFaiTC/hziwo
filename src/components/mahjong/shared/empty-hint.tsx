"use client";

import { Button } from "@/components/ui/button";

export function EmptyHint({
  title,
  desc,
  action,
  onAction,
}: {
  title: string;
  desc: string;
  action: string;
  onAction: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
      <p className="font-display text-lg text-ink/80">{title}</p>
      <p className="text-sm text-ink-soft">{desc}</p>
      <Button className="mt-2" variant="secondary" onClick={onAction}>
        {action}
      </Button>
    </div>
  );
}
