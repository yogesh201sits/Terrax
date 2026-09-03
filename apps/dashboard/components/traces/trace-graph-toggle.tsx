"use client";

import { useState } from "react";
import type { TraceTreeNode } from "@/types/trace-detail";
import { TraceGraph } from "./trace-graph";

type Props = {
  roots: TraceTreeNode[];
};

export function TraceGraphToggle({ roots }: Props) {
  const [showGraph, setShowGraph] = useState(false);

  return (
    <div className="mt-4">
      <div className="flex items-center justify-between rounded-lg border px-4 py-3">
        <div>
          <p className="text-sm font-medium">
            Execution Graph
          </p>

          <p className="text-xs text-muted-foreground">
            Visualize agent execution hierarchy
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowGraph(!showGraph)}
          className="rounded-md border px-3 py-1.5 text-xs font-medium hover:bg-muted"
        >
          {showGraph ? "Hide Graph" : "Show Graph"}
        </button>
      </div>

      {showGraph && (
        <div className="mt-3">
          <TraceGraph roots={roots} />
        </div>
      )}
    </div>
  );
}
