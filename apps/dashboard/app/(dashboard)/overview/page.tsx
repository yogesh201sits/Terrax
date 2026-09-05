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
    icon={Activity}
    title="Total Traces"
    value={metrics.totalTraces.toLocaleString()}
    description="AI agent executions recorded"
  />

  <MetricCard
    icon={AlertTriangle}
    error
    title="Error Rate"
    value={`${metrics.errorRate.toFixed(1)}%`}
    description={`${metrics.errorTraces} failed executions`}
  />

  <MetricCard
    icon={Clock3}
    title="Avg. Duration"
    value={formatDuration(metrics.averageDuration)}
    description="Average execution latency"
  />

  <MetricCard
    icon={Coins}
    title="Total Tokens"
    value={metrics.totalTokens.toLocaleString()}
    description="Input + output usage"
  />
</div>

  {/* Trace Activity */}
  <div
    className="
      overflow-hidden
      rounded-2xl
      border
      border-[#e5e5e5]
      bg-[#f5f5f5]
      p-1
      shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]
    "
  >
    <TraceActivityChart traces={traces} />
  </div>

  {/* Recent Traces */}
  <section
    className="
      overflow-hidden
      rounded-2xl
      border
      border-[#e5e5e5]
      bg-[#f5f5f5]
      shadow-[0_2px_8px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.03)]
    "
  >
    <div
      className="
        flex
        items-center
        justify-between
        border-b
        border-[#e7e7e7]
        px-5
        py-4
      "
    >
      <div>
        <h2 className="font-semibold tracking-tight text-[#303030]">
          Recent Traces
        </h2>

        <p className="mt-1 text-xs text-[#858585]">
          Latest AI agent executions
        </p>
      </div>

      <Link
        href="/traces"
        className="
          rounded-md
          px-3
          py-1.5
          text-xs
          font-medium
          text-[#707070]
          transition-all
          duration-200
          hover:bg-[#ededed]
          hover:text-[#333333]
          active:scale-[0.98]
        "
      >
        View all →
      </Link>
    </div>

    {recentTraces.length === 0 ? (
      <div className="p-8 text-center text-sm text-[#858585]">
        No traces available.
      </div>
    ) : (
      <div className="divide-y divide-[#e8e8e8]">
        {recentTraces.map((trace) => {
          const hasError =
            trace.status.toLowerCase() === "error" ||
            trace.status.toLowerCase() === "failed";

          return (
            <Link
              key={trace.traceId}
              href={`/traces/${encodeURIComponent(trace.traceId)}`}
              className="
                group
                flex
                items-center
                justify-between
                gap-4
                px-5
                py-4
                transition-all
                duration-200
                hover:bg-[#eeeeee]
              "
            >
              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-sm
                    font-medium
                    tracking-tight
                    text-[#353535]
                    transition-colors
                    group-hover:text-[#111111]
                  "
                >
                  {trace.name}
                </p>

                <p className="mt-1 truncate text-xs text-[#999999]">
                  {trace.traceId}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-5 text-xs">
                <span
                  className={
                    hasError
                      ? "rounded-md bg-red-50 px-2 py-1 font-medium text-red-500"
                      : "rounded-md bg-[#eaeaea] px-2 py-1 font-medium text-[#666666]"
                  }
                >
                  {hasError ? "ERROR" : "OK"}
                </span>

                <span className="tabular-nums text-[#777777]">
                  {formatDuration(trace.durationMs)}
                </span>

                <span className="hidden tabular-nums text-[#888888] sm:inline">
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

import {
  Activity,
  AlertTriangle,
  Clock3,
  Coins,
} from "lucide-react";

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  error = false,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  error?: boolean;
}) {
  return (
    <div
      className={`
        group
        relative
        overflow-hidden
        rounded-2xl
        border
        p-5
        transition-all
        duration-200
        hover:-translate-y-0.5
        ${
          error
            ? "border-red-100 bg-[#f6f6f6]"
            : "border-[#e4e4e4] bg-[#f6f6f6]"
        }
        shadow-[0_1px_2px_rgba(0,0,0,0.03),0_6px_18px_rgba(0,0,0,0.035)]
        hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_12px_28px_rgba(0,0,0,0.04)]
      `}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`
            flex
            size-8
            items-center
            justify-center
            rounded-lg
            border
            ${
              error
                ? "border-red-100 bg-red-50 text-red-500"
                : "border-[#e1e1e1] bg-[#eeeeee] text-[#6f6f6f]"
            }
          `}
        >
          <Icon className="size-4" strokeWidth={1.8} />
        </div>

        <p
          className={`
            text-xs
            font-medium
            tracking-wide
            ${error ? "text-red-500" : "text-[#777777]"}
          `}
        >
          {title}
        </p>
      </div>

      <div className="mt-4">
        <p
          className={`
            text-2xl
            font-semibold
            tracking-tight
            tabular-nums
            ${error ? "text-red-500" : "text-[#292929]"}
          `}
        >
          {value}
        </p>

        <p className="mt-1.5 text-[11px] text-[#999999]">
          {description}
        </p>
      </div>
    </div>
  );
}
