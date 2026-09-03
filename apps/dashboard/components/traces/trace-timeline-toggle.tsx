"use client";

import { useState } from "react";
import type { TraceTreeNode } from "@/types/trace-detail";
import { TraceTimeline } from "./trace-timeline";

type Props = {
  roots: TraceTreeNode[];
};

export function TraceTimelineToggle({ roots }: Props) {
  const [showTimeline, setShowTimeline] = useState(false);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <p className="text-sm font-medium">
            Timeline
          </p>

          <p className="text-xs text-muted-foreground">
            View span execution timing
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowTimeline(!showTimeline)}
          className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          {showTimeline ? "Hide Timeline" : "Show Timeline"}
        </button>
      </div>

      {showTimeline && (
        <div className="mt-3">
          <TraceTimeline roots={roots} />
        </div>
      )}
    </div>
  );
}