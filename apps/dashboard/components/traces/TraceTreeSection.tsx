"use client";

import { useState } from "react";
import { Maximize2, X } from "lucide-react";

import { TraceTree } from "@/components/traces/trace-tree";

import type { TraceDetail } from "@/types/trace-detail";

type Props = {
  roots: TraceDetail["tree"]["roots"];
};

export function TraceTreeSection({
  roots,
}: Props) {
  const [fullscreen, setFullscreen] =
    useState(false);

  const spanCount = countSpans(roots);

  return (
    <>
      {/* Normal tree */}
      <section className="mt-8">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight">
                Execution
              </h2>

              <span className="rounded-md border bg-muted/30 px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                {spanCount}{" "}
                {spanCount === 1 ? "span" : "spans"}
              </span>
            </div>

            <p className="mt-1 text-xs text-muted-foreground">
              Explore the execution hierarchy of this trace.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Maximize2 className="size-3.5" />
            Fullscreen
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card">
          <TraceTree roots={roots} />
        </div>
      </section>

      {/* Fullscreen tree */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-background">

          {/* Header */}
          <div className="flex h-14 items-center justify-between border-b px-5">

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold">
                  Execution
                </h2>

                <span className="rounded-md border bg-muted/30 px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                  {spanCount}{" "}
                  {spanCount === 1 ? "span" : "spans"}
                </span>
              </div>

              <p className="text-[11px] text-muted-foreground">
                Trace execution hierarchy
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFullscreen(false)}
              className="inline-flex items-center gap-1.5 rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
              Close
            </button>

          </div>

          {/* Fullscreen content */}
          <div className="h-[calc(100vh-3.5rem)] overflow-auto">
            <div className="mx-auto w-full max-w-[1800px] p-5 lg:p-8">
              <div className="overflow-hidden rounded-xl border bg-card">
                <TraceTree roots={roots} />
              </div>
            </div>
          </div>

        </div>
      )}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function countSpans(
  roots: TraceDetail["tree"]["roots"],
) {
  let count = 0;

  function visit(
    node: TraceDetail["tree"]["roots"][number],
  ) {
    count += 1;

    for (const child of node.children) {
      visit(child);
    }
  }

  for (const root of roots) {
    visit(root);
  }

  return count;
}