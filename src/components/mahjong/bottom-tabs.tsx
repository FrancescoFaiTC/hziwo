"use client";

import { FlagIcon, SpadeIcon, UsersIcon } from "lucide-react";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TabId = "round" | "table" | "end";

export function BottomTabs() {
  return (
    <TabsList className="panel z-20 mx-3 mb-[max(0.5rem,env(safe-area-inset-bottom))] grid h-auto w-auto shrink-0 grid-cols-3 gap-1.5 rounded-md !h-auto p-2">
      <TabsTrigger
        value="round"
        className="min-h-12 flex-col gap-0.5 rounded-md px-2 py-1.5 text-xs data-active:bg-vermilion data-active:text-primary-foreground data-active:shadow-none"
      >
        <SpadeIcon className="size-5" />
        计分
      </TabsTrigger>
      <TabsTrigger
        value="table"
        className="min-h-12 flex-col gap-0.5 rounded-md px-2 py-1.5 text-xs data-active:bg-vermilion data-active:text-primary-foreground data-active:shadow-none"
      >
        <UsersIcon className="size-5" />
        牌桌
      </TabsTrigger>
      <TabsTrigger
        value="end"
        className="min-h-12 flex-col gap-0.5 rounded-md px-2 py-1.5 text-xs data-active:bg-vermilion data-active:text-primary-foreground data-active:shadow-none"
      >
        <FlagIcon className="size-5" />
        结算
      </TabsTrigger>
    </TabsList>
  );
}
