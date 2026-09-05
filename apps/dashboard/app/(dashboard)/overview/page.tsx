import Link from "next/link";

import {
  getTrace,
  getTraces,
} from "@/lib/api/traces";

import { TraceActivityChart } from "@/components/dashboard/trace-activity-chart";

import type { TraceDetail } from "@/types/trace-detail";

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}

async function calculateMetrics(
  traces: Awaited<ReturnType<typeof getTraces>>["traces"],
) {
  const totalTraces = traces.length;

  /*
   * Fetch the complete trace for each summary
   * so we can inspect all spans.
   */
  const traceDetails = await Promise.all(
    traces.map((trace) =>
      getTrace(trace.traceId),
    ),
  );

  /*
   * A trace is ERROR if any span in its tree
   * contains an errorMessage.
   */
  const errorTraces = traceDetails.filter(
    (trace) => {
      const spans = flattenTree(
        trace.tree.roots,
      );

      return spans.some(
        (node) =>
          Boolean(node.span.errorMessage),
      );
    },
  ).length;

  const errorRate =
    totalTraces > 0
      ? (errorTraces / totalTraces) * 100
      : 0;

  const averageDuration =
    totalTraces > 0
      ? traces.reduce(
          (total, trace) =>
            total + trace.durationMs,
          0,
        ) / totalTraces
      : 0;

  const totalTokens = traces.reduce(
    (total, trace) =>
      total + trace.totalTokens,
    0,
  );

  return {
    totalTraces,
    errorTraces,
    errorRate,
    averageDuration,
    totalTokens,
  };
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

export default async function OverviewPage() {
  const { traces } = await getTraces();

  /*
   * calculateMetrics is async because it fetches
   * the complete trace trees.
   */
  const metrics = await calculateMetrics(traces);

  const recentTraces = traces.slice(0, 5);

return (
  <div className="min-h-full bg-[#f2f2f2] p-6">
    {/* Header */}
    <div className="mb-6">
      <h1
        className="
          text-2xl
          font-semibold
          tracking-tight
          text-[#333333]
          [text-shadow:1px_1px_1px_#d0d0d0,-1px_-1px_1px_#ffffff]
        "
      >
        Overview
      </h1>

      <p
        className="
          mt-1
          text-sm
          text-[#777777]
          [text-shadow:1px_1px_1px_#d5d5d5,-1px_-1px_1px_#ffffff]
        "
      >
        Monitor your AI agent executions and system activity.
      </p>
    </div>

    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Traces"
          value={metrics.totalTraces.toLocaleString()}
          description="Recorded executions"
        />

        <MetricCard
          title="Error Rate"
          value={`${metrics.errorRate.toFixed(1)}%`}
          description={`${metrics.errorTraces} failed traces`}
        />

        <MetricCard
          title="Avg. Duration"
          value={formatDuration(metrics.averageDuration)}
          description="Across all traces"
        />

        <MetricCard
          title="Total Tokens"
          value={metrics.totalTokens.toLocaleString()}
          description="Input + output tokens"
        />
      </div>

      {/* Trace Activity */}
      <div
        className="
          rounded-2xl
          bg-[#f2f2f2]
          p-1
          shadow-[6px_6px_12px_#d2d2d2,-6px_-6px_12px_#ffffff]
        "
      >
        <TraceActivityChart traces={traces} />
      </div>

      {/* Recent Traces */}
      <section
        className="
          overflow-hidden
          rounded-2xl
          bg-[#f2f2f2]
          shadow-[6px_6px_12px_#d2d2d2,-6px_-6px_12px_#ffffff]
        "
      >
        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-[#dddddd]
            px-5
            py-4
          "
        >
          <div>
            <h2
              className="
                font-semibold
                text-[#333333]
                [text-shadow:1px_1px_1px_#d0d0d0,-1px_-1px_1px_#ffffff]
              "
            >
              Recent Traces
            </h2>

            <p
              className="
                mt-1
                text-xs
                text-[#777777]
                [text-shadow:1px_1px_1px_#d5d5d5,-1px_-1px_1px_#ffffff]
              "
            >
              Latest AI agent executions
            </p>
          </div>

          <Link
            href="/traces"
            className="
              rounded-lg
              px-3
              py-2
              text-xs
              font-medium
              text-[#666666]
              transition-all
              hover:text-[#333333]
              hover:shadow-[3px_3px_6px_#d2d2d2,-3px_-3px_6px_#ffffff]
              active:shadow-[inset_2px_2px_4px_#d2d2d2,inset_-2px_-2px_4px_#ffffff]
            "
          >
            View all →
          </Link>
        </div>

        {recentTraces.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#777777]">
            No traces available.
          </div>
        ) : (
          <div className="divide-y divide-[#dddddd]">
            {recentTraces.map((trace) => {
              const hasError =
                trace.status.toLowerCase() === "error" ||
                trace.status.toLowerCase() === "failed";

              return (
                <Link
                  key={trace.traceId}
                  href={`/traces/${encodeURIComponent(
                    trace.traceId,
                  )}`}
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    px-5
                    py-4
                    transition-all
                    hover:bg-[#eeeeee]
                    hover:[box-shadow:inset_2px_2px_5px_#d8d8d8,inset_-2px_-2px_5px_#ffffff]
                  "
                >
                  <div className="min-w-0">
                    <p
                      className="
                        truncate
                        text-sm
                        font-medium
                        text-[#333333]
                        [text-shadow:1px_1px_1px_#d0d0d0]
                      "
                    >
                      {trace.name}
                    </p>

                    <p className="mt-1 truncate text-xs text-[#888888]">
                      {trace.traceId}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-5 text-xs">
                    <span
                      className={
                        hasError
                          ? "font-medium text-red-500 [text-shadow:1px_1px_1px_#cccccc]"
                          : "font-medium text-[#666666] [text-shadow:1px_1px_1px_#d0d0d0]"
                      }
                    >
                      {hasError ? "ERROR" : "OK"}
                    </span>

                    <span className="tabular-nums text-[#777777]">
                      {formatDuration(trace.durationMs)}
                    </span>

                    <span className="hidden tabular-nums text-[#777777] sm:inline">
                      {trace.totalTokens.toLocaleString()} tokens
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  </div>
);

}

function MetricCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border bg-card p-5">
      <p className="text-sm font-medium text-muted-foreground">
        {title}
      </p>

      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">
        {value}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        {description}
      </p>
    </div>
  );
}
