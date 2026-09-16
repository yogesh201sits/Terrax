import type { TraceTreeNode } from "@/types/trace-detail";

import {
  Activity,
  Bot,
  CheckCircle2,
  Clock3,
  Coins,
  Wrench,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";


type Props = {
  roots: TraceTreeNode[];
};



export function TraceSummary({ roots }: Props) {
  const spans = flattenTree(roots);

  const durationMs = getTraceDuration(roots);

  const llmCalls = spans.filter(
    (node) => node.span.type === "llm",
  ).length;

  const toolCalls = spans.filter(
    (node) => node.span.type === "tool",
  ).length;

  const totalTokens = spans.reduce(
    (total, node) => total + (node.span.totalTokens ?? 0),
    0,
  );

  const hasError = spans.some(
    (node) => Boolean(node.span.errorMessage),
  );

  return (
    <div className="mb-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-b pb-4">
      <SummaryStat
        label="Duration"
        value={formatDuration(durationMs)}
      />

      <SummaryStat
        label="Spans"
        value={spans.length.toLocaleString()}
      />

      <SummaryStat
        label="LLM Calls"
        value={llmCalls.toLocaleString()}
      />

      <SummaryStat
        label="Tool Calls"
        value={toolCalls.toLocaleString()}
      />

      <SummaryStat
        label="Tokens"
        value={totalTokens.toLocaleString()}
      />

      <div className="ml-auto flex items-center">
        <span
          className={
            hasError
              ? "inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[11px] font-medium text-destructive"
              : "inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400"
          }
        >
          <span
            className={
              hasError
                ? "size-1.5 rounded-full bg-destructive"
                : "size-1.5 rounded-full bg-emerald-500"
            }
          />

          {hasError ? "Failed" : "Completed"}
        </span>
      </div>
    </div>
  );
}
function SummaryStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </span>

      <span className="font-mono text-sm font-semibold tabular-nums">
        {value}
      </span>
    </div>
  );
}


type StatProps = {
  icon: LucideIcon;
  label: string;
  value: string | number;
};

function Stat({
  icon: Icon,
  label,
  value,
}: StatProps) {
  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="size-3.5" strokeWidth={1.8} />

        <span className="text-xs font-medium">
          {label}
        </span>
      </div>

      <div className="mt-2 text-lg font-semibold tracking-tight">
        {value}
      </div>
    </div>
  );
}

function flattenTree(roots: TraceTreeNode[]) {
  const result: TraceTreeNode[] = [];

  function visit(node: TraceTreeNode) {
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

function getTraceDuration(roots: TraceTreeNode[]) {
  if (roots.length === 0) {
    return 0;
  }

  const startTimes = roots.map((root) =>
    new Date(root.span.startTime).getTime(),
  );

  const endTimes = roots.map((root) =>
    new Date(root.span.endTime).getTime(),
  );

  return Math.max(...endTimes) - Math.min(...startTimes);
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}