"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ResetGameDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="gap-3 overflow-hidden rounded-md sm:max-w-md"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="font-display">重新开始？</DialogTitle>
          <DialogDescription>
            玩家、比赛历史、抽水池和结算状态都会清空，而且没法恢复。
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 pt-1">
          <Button className="w-full" size="lg" onClick={onConfirm}>
            确认清空
          </Button>
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            取消
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
