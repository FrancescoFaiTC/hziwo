"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

const UI_SCALE_STORAGE_KEY = "hziwo-ui-scale";

export const UI_SCALE_MIN = 0.8;
export const UI_SCALE_MAX = 1.25;
export const UI_SCALE_STEP = 0.05;
export const UI_SCALE_DEFAULT = 1;

function clampScale(n: number): number {
  const rounded = Math.round(n / UI_SCALE_STEP) * UI_SCALE_STEP;
  return Math.min(
    UI_SCALE_MAX,
    Math.max(UI_SCALE_MIN, Number(rounded.toFixed(2)))
  );
}

function readStoredScale(): number {
  if (typeof window === "undefined") return UI_SCALE_DEFAULT;
  try {
    const raw = localStorage.getItem(UI_SCALE_STORAGE_KEY);
    if (raw == null) return UI_SCALE_DEFAULT;
    const n = Number(raw);
    if (!Number.isFinite(n)) return UI_SCALE_DEFAULT;
    return clampScale(n);
  } catch {
    return UI_SCALE_DEFAULT;
  }
}

function persistScale(scale: number) {
  if (typeof document !== "undefined") {
    document.documentElement.style.setProperty("--ui-scale", String(scale));
  }
  try {
    localStorage.setItem(UI_SCALE_STORAGE_KEY, String(scale));
  } catch {
    // ignore quota / private mode
  }
}

const subscribeNoop = () => () => {};

export function useUiScale() {
  const isClient = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );
  const [scale, setScaleState] = useState(UI_SCALE_DEFAULT);
  const [hydrated, setHydrated] = useState(false);

  // 客户端渲染期灌入已保存缩放，避免 effect 闪一下 100%
  if (isClient && !hydrated) {
    const next = readStoredScale();
    setScaleState(next);
    persistScale(next);
    setHydrated(true);
  }

  const setScale = useCallback((next: number) => {
    const clamped = clampScale(next);
    setScaleState(clamped);
    persistScale(clamped);
  }, []);

  const reset = useCallback(() => {
    setScale(UI_SCALE_DEFAULT);
  }, [setScale]);

  return {
    percent: Math.round(scale * 100),
    setScale,
    reset,
  };
}

export type UiScaleApi = ReturnType<typeof useUiScale>;
