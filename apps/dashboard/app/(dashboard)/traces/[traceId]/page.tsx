import Link from "next/link";

import { getTrace } from "@/lib/api/traces";
import { TraceSummary } from "@/components/traces/trace-summary";
import { TraceTree } from "@/components/traces/trace-tree";
import { TraceTreeSection } from "@/components/traces/TraceTreeSection";
import { TraceExplorer } from "@/components/traces/trace-explorer";
import { CopyTraceId } from "@/components/traces/copy-trace-id";

import type { TraceDetail } from "@/types/trace-detail";

type Props = {
  params: Promise<{
    traceId: string;
  }>;
};

export default async function TraceDetailPage({
  params,
}: Props) {
  const { traceId } = await params;

  const decodedTraceId = decodeURIComponent(traceId);

  const trace = await getTrace(decodedTraceId);

  const roots = trace.tree.roots;

  const spans = flattenTree(roots);

  const startTime = getTraceStartTime(spans);
  const endTime = getTraceEndTime(spans);

  const durationMs =
    startTime !== null && endTime !== null
      ? Math.max(0, endTime - startTime)
      : 0;

  const hasError = spans.some(
    (node) => Boolean(node.span.errorMessage),
  );

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8">

        {/* ================================================================ */}
        {/* Breadcrumb                                                        */}
        {/* ================================================================ */}

        <div className="mb-5">
          <Link
            href="/traces"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="text-sm">
              ←
            </span>

            Traces
          </Link>
        </div>

        {/* ================================================================ */}
        {/* Trace Header                                                      */}
        {/* ================================================================ */}

        <section className="overflow-hidden border-b bg-card">
          <div className="px-4 py-4 lg:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Trace identity */}
              <div className="min-w-0 flex-1">
                {/* Name + status */}
                <div className="flex min-w-0 items-center gap-2">
                  <h1 className="min-w-0 truncate text-base font-semibold tracking-tight">
                    {roots[0]?.span.name ?? "Trace"}
                  </h1>

                  <StatusBadge hasError={hasError} />
                </div>

                {/* Trace ID */}
                <div className="mt-1.5">
                  <CopyTraceId traceId={decodedTraceId} />
                </div>
              </div>

              {/* Quick stats */}
              <div className="flex shrink-0 items-center divide-x rounded-md border bg-background">
                <StatPill
                  label="Duration"
                  value={formatDuration(durationMs)}
                />

                <StatPill
                  label="Spans"
                  value={String(spans.length)}
                />
              </div>
            </div>

            {/* Metadata */}
            {(startTime !== null ||
              (startTime !== null && endTime !== null)) && (
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-muted-foreground">
                  {startTime !== null && (
                    <>
                      <span>Started {formatDateTime(startTime)}</span>
                    </>
                  )}

                  {startTime !== null && endTime !== null && (
                    <>
                      <span className="text-muted-foreground/40">
                        ·
                      </span>

                      <span className="font-mono tabular-nums">
                        {formatTime(startTime)}
                        <span className="mx-1.5 text-muted-foreground/40">
                          →
                        </span>
                        {formatTime(endTime)}
                      </span>

                      <span className="text-muted-foreground/40">
                        ·
                      </span>

                      <span className="font-mono tabular-nums">
                        {formatDuration(durationMs)}
                      </span>
                    </>
                  )}
                </div>
              )}
          </div>
        </section>

        {/* ================================================================ */}
        {/* Summary                                                           */}
        {/* ================================================================ */}

        <section className="mt-5">
          <TraceSummary roots={roots} />
        </section>

        {/* ================================================================ */}
        {/* Execution Tree                                                    */}
        {/* ================================================================ */}

        {/* <section className="mt-8">

          <div className="mb-4">
            <h2 className="text-base font-semibold tracking-tight">
              Execution
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Explore the execution hierarchy of this trace.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border bg-card">
            <TraceTree roots={roots} />
          </div>

        </section> */}
        <TraceTreeSection roots={roots} />


        {/* ================================================================ */}
        {/* Timeline / Graph                                                  */}
        {/* ================================================================ */}

        <section className="mt-8">

          <div className="mb-4">
            <h2 className="text-base font-semibold tracking-tight">
              Visualization
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Explore the timing and structure of the trace.
            </p>
          </div>

          <TraceExplorer roots={roots} />

        </section>

      </div>
    </div>
  );
}

/* ========================================================================== */
/* UI                                                                         */
/* ========================================================================== */

function StatusBadge({
  hasError,
}: {
  hasError: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5",
        "text-[10px] font-medium uppercase tracking-wide",

        hasError
          ? "border-destructive/30 bg-destructive/5 text-destructive"
          : "border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",

          hasError
            ? "bg-destructive"
            : "bg-emerald-500",
        ].join(" ")}
      />

      {hasError ? "Error" : "OK"}
    </span>
  );
}

function StatPill({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-2.5 py-1.5">

      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>

      <span className="text-xs font-semibold tabular-nums">
        {value}
      </span>

    </div>
  );
}

/* ========================================================================== */
/* Trace Helpers                                                              */
/* ========================================================================== */

function flattenTree(
  roots: TraceDetail["tree"]["roots"],
) {
  const result: TraceDetail["tree"]["roots"] = [];

  function visit(
    node: TraceDetail["tree"]["roots"][number],
  ) {
    result.push(node);

    for (const child of node.children) {
      visit(child);
    }
  }

  for (const root of roots) {
    visit(root);
  }

  return result;
}

function getTraceStartTime(
  spans: TraceDetail["tree"]["roots"],
) {
  if (spans.length === 0) {
    return null;
  }

  return Math.min(
    ...spans.map((node) =>
      new Date(node.span.startTime).getTime(),
    ),
  );
}

function getTraceEndTime(
  spans: TraceDetail["tree"]["roots"],
) {
  if (spans.length === 0) {
    return null;
  }

  return Math.max(
    ...spans.map((node) =>
      new Date(node.span.endTime).getTime(),
    ),
  );
}

function formatDateTime(timestamp: number) {
  return new Date(timestamp).toLocaleString();
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
  });
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }

  if (durationMs < 60_000) {
    return `${(durationMs / 1000).toFixed(2)}s`;
  }

  const minutes = Math.floor(durationMs / 60_000);

  const seconds =
    (durationMs % 60_000) / 1000;

  return `${minutes}m ${seconds.toFixed(1)}s`;
}
