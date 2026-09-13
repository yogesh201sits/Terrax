"use client";

import { useState } from "react";

import { TraceTimeline } from "@/components/traces/trace-timeline";
import { TraceGraph } from "@/components/traces/trace-graph";

import type { TraceDetail } from "@/types/trace-detail";

type Props = {
  roots: TraceDetail["tree"]["roots"];
};

type View = "timeline" | "graph";

export function TraceExplorer({
  roots,
}: Props) {
  const [view, setView] =
    useState<View>("timeline");

  return (
    <div className="w-full overflow-hidden rounded-xl border bg-card">

      {/* ================================================================ */}
      {/* Toolbar                                                          */}
      {/* ================================================================ */}

      <div className="flex h-12 items-center justify-between border-b bg-muted/20 px-3">

        <div className="flex items-center gap-1">

          <ViewButton
            active={view === "timeline"}
            onClick={() => setView("timeline")}
          >
            Timeline
          </ViewButton>

          <ViewButton
            active={view === "graph"}
            onClick={() => setView("graph")}
          >
            Graph
          </ViewButton>

        </div>

        <span className="hidden text-[10px] text-muted-foreground sm:block">
          {view === "timeline"
            ? "Trace timing"
            : "Trace structure"}
        </span>

      </div>

      {/* ================================================================ */}
      {/* Timeline                                                          */}
      {/* ================================================================ */}

      {view === "timeline" && (
        <div className="w-full overflow-x-auto">
          <TraceTimeline roots={roots} />
        </div>
      )}

      {/* ================================================================ */}
      {/* Graph                                                             */}
      {/* ================================================================ */}

      {view === "graph" && (
        <div className="h-[700px] w-full overflow-hidden">
          <TraceGraph roots={roots} />
        </div>
      )}

    </div>
  );
}

/* ========================================================================== */
/* View Button                                                                */
/* ========================================================================== */

function ViewButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "rounded-md px-3 py-1.5",
        "text-xs font-medium",
        "transition-colors",

        active
          ? "bg-background text-foreground shadow-sm ring-1 ring-border"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
