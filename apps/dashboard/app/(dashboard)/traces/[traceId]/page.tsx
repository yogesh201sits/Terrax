import Link from "next/link";

import { getTrace } from "@/lib/api/traces";
import { TraceTree } from "@/components/traces/trace-tree";
import { TraceSummary } from "@/components/traces/trace-summary";
import { TraceTimelineToggle } from "@/components/traces/trace-timeline-toggle";
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

  const root = trace.tree.roots[0];

  const spans = flattenTree(trace.tree.roots);

  const startTime = getTraceStartTime(
    trace.tree.roots,
  );

  const endTime = getTraceEndTime(
    trace.tree.roots,
  );

  const durationMs =
    endTime !== null && startTime !== null
      ? endTime - startTime
      : 0;

  const hasError = spans.some(
    (node) => Boolean(node.span.errorMessage),
  );

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="mb-5">
        <Link
          href="/traces"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Traces
        </Link>
      </div>

      {/* Trace Header */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="truncate text-2xl font-semibold tracking-tight">
                {root?.span.name ?? "Trace"}
              </h1>

              <StatusBadge hasError={hasError} />
            </div>

            {/* Trace ID */}
            <div className="mt-2 flex max-w-full items-center gap-2">
              <p className="min-w-0 break-all font-mono text-xs text-muted-foreground">
                {decodedTraceId}
              </p>

              <CopyTraceId traceId={decodedTraceId} />
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
          {startTime !== null && (
            <span>
              Started {formatDateTime(startTime)}
            </span>
          )}

          <span>
            Duration {formatDuration(durationMs)}
          </span>

          <span>
            {spans.length}{" "}
            {spans.length === 1 ? "span" : "spans"}
          </span>
        </div>

        {/* Timing */}
        {startTime !== null && endTime !== null && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>
              {formatTime(startTime)}
            </span>

            <div className="h-px w-8 bg-border" />

            <span>
              {formatTime(endTime)}
            </span>

            <span className="ml-1">
              ({formatDuration(durationMs)})
            </span>
          </div>
        )}
      </div>

      {/* Summary */}
      <TraceSummary roots={trace.tree.roots} />

      {/* Execution */}
      <TraceTree roots={trace.tree.roots} />

      {/* Timeline */}
      <TraceTimelineToggle roots={trace.tree.roots} />
    </div>
  );
}

function StatusBadge({
  hasError,
}: {
  hasError: boolean;
}) {
  return (
    <span
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
        hasError
          ? "text-destructive"
          : "text-muted-foreground"
      }`}
    >
      {hasError ? "ERROR" : "OK"}
    </span>
  );
}

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
  roots: TraceDetail["tree"]["roots"],
) {
  const spans = flattenTree(roots);

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
  roots: TraceDetail["tree"]["roots"],
) {
  const spans = flattenTree(roots);

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
  return new Date(timestamp).toLocaleTimeString(
    [],
    {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    },
  );
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}