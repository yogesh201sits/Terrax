import Link from "next/link";

import type { TraceSummary } from "@/types/traces";

type TraceTableProps = {
  traces: TraceSummary[];
};

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}

function formatTokens(tokens: number) {
  return tokens.toLocaleString();
}

export function TraceTable({ traces }: TraceTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40">
          <tr className="text-left">
            <th className="px-4 py-3 font-medium">
              Trace
            </th>

            <th className="px-4 py-3 font-medium">
              Duration
            </th>

            <th className="px-4 py-3 font-medium">
              Spans
            </th>

            <th className="px-4 py-3 font-medium">
              LLM
            </th>

            <th className="px-4 py-3 font-medium">
              Tools
            </th>

            <th className="px-4 py-3 font-medium">
              Tokens
            </th>

            <th className="px-4 py-3 font-medium">
              Status
            </th>
          </tr>
        </thead>

        <tbody>
          {traces.map((trace) => (
            <tr
              key={trace.traceId}
              className="border-b last:border-0 hover:bg-muted/30"
            >
              <td className="px-4 py-3">
                <Link
                href={`/traces/${encodeURIComponent(trace.traceId)}`}
                className="font-medium hover:underline"
              >
                {trace.name}
              </Link>

                <div className="mt-1 font-mono text-xs text-muted-foreground">
                  {trace.traceId.slice(0, 16)}...
                </div>
              </td>

              <td className="px-4 py-3">
                {formatDuration(trace.durationMs)}
              </td>

              <td className="px-4 py-3">
                {trace.spanCount}
              </td>

              <td className="px-4 py-3">
                {trace.llmCalls}
              </td>

              <td className="px-4 py-3">
                {trace.toolCalls}
              </td>

              <td className="px-4 py-3">
                {formatTokens(trace.totalTokens)}
              </td>

              <td className="px-4 py-3">
                <span
                  className={
                    trace.status === "ERROR"
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {trace.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}