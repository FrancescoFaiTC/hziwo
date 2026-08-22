"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NumberStepper } from "@/components/mahjong/shared/number-stepper";
import {
  UI_SCALE_DEFAULT,
  UI_SCALE_MAX,
  UI_SCALE_MIN,
  UI_SCALE_STEP,
  useUiScale,
} from "@/lib/ui-scale";

const PERCENT_MIN = Math.round(UI_SCALE_MIN * 100);
const PERCENT_MAX = Math.round(UI_SCALE_MAX * 100);
const PERCENT_STEP = Math.round(UI_SCALE_STEP * 100);
const PERCENT_DEFAULT = Math.round(UI_SCALE_DEFAULT * 100);

export function SettingsTab() {
  const uiScale = useUiScale();

  return (
    <ScrollArea className="min-h-0 flex-1 px-3">
      <div className="space-y-4 py-2">
        <section className="panel space-y-3 rounded-md p-3.5">
          <div>
            <p className="font-display text-base">界面缩放</p>
            <p className="text-[11px] text-ink-soft">
              调整内容区大小 · 底栏导航不受影响 · {PERCENT_MIN}%–
              {PERCENT_MAX}%
            </p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <Label className="text-xs text-ink-soft">缩放比例 (%)</Label>
            <NumberStepper
              value={uiScale.percent}
              min={PERCENT_MIN}
              max={PERCENT_MAX}
              step={PERCENT_STEP}
              signed={false}
              onChange={(n) => uiScale.setScale(n / 100)}
            />
          </div>
          <Button
            className="w-full"
            variant="outline"
            disabled={uiScale.percent === PERCENT_DEFAULT}
            onClick={uiScale.reset}
          >
            恢复默认
          </Button>
        </section>
      </div>
    </ScrollArea>
  );
}
