"use client";

import {
  Bell,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Notifications() {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="
            relative
            size-8
            rounded-lg
            text-[#666666]
            hover:bg-[#dedede]
            hover:text-[#222222]
          "
        >
          <Bell className="size-4" />

          <span className="absolute right-1 top-1 size-1.5 rounded-full bg-[#222222]" />

          <span className="sr-only">
            Notifications
          </span>
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="
          w-80
          rounded-xl
          border-[#d5d5d5]
          bg-[#e8e8e8]
          p-0
          shadow-[8px_8px_16px_#c7c7c7,-8px_-8px_16px_#ffffff]
        "
      >
        <div className="flex items-center justify-between border-b border-[#d5d5d5] px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[#222222]">
              Notifications
            </p>

            <p className="mt-0.5 text-xs text-[#777777]">
              Recent updates and activity
            </p>
          </div>

          <span className="rounded-full bg-[#dedede] px-2 py-1 text-[10px] font-medium text-[#666666]">
            1 new
          </span>
        </div>

        <div className="p-2">
          <div className="flex gap-3 rounded-lg px-3 py-3 hover:bg-[#dedede]">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#e8e8e8] shadow-[inset_2px_2px_4px_#c9c9c9,inset_-2px_-2px_4px_#ffffff]">
              <CheckCircle2 className="size-4 text-[#555555]" />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-medium text-[#333333]">
                Terrax is operational
              </p>

              <p className="mt-1 text-xs leading-5 text-[#777777]">
                All telemetry services are running normally.
              </p>

              <p className="mt-1 text-[10px] text-[#999999]">
                Just now
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#d5d5d5] px-4 py-2.5">
          <button
            type="button"
            className="text-xs font-medium text-[#666666] hover:text-[#222222]"
          >
            Mark all as read
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}