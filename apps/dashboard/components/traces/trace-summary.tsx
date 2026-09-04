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

  const totalTokens = spans.reduce((total, node) => {
    return total + (node.span.totalTokens ?? 0);
  }, 0);

  const hasError = spans.some(
    (node) => Boolean(node.span.errorMessage),
  );

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
      <Stat
        icon={Clock3}
        label="Duration"
        value={formatDuration(durationMs)}
      />

      <Stat
        icon={Activity}
        label="Spans"
        value={spans.length.toLocaleString()}
      />

      <Stat
        icon={Bot}
        label="LLM Calls"
        value={llmCalls.toLocaleString()}
      />

      <Stat
        icon={Wrench}
        label="Tool Calls"
        value={toolCalls.toLocaleString()}
      />

      <Stat
        icon={Coins}
        label="Tokens"
        value={totalTokens.toLocaleString()}
      />

      {/* Trace status */}
      <div className="col-span-2 rounded-lg border p-4 md:col-span-3 lg:col-span-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasError ? (
              <XCircle className="size-4 text-destructive" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}

            <span className="text-sm font-medium">
              {hasError ? "Trace failed" : "Trace completed successfully"}
            </span>
          </div>

          <span className="text-xs text-muted-foreground">
            {spans.length} {spans.length === 1 ? "span" : "spans"}
          </span>
        </div>
      </div>
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