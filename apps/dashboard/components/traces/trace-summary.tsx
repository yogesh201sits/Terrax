import type { TraceTreeNode } from "@/types/trace-detail";

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
    <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
      <Stat label="Duration" value={formatDuration(durationMs)} />
      <Stat label="Spans" value={String(spans.length)} />
      <Stat label="LLM Calls" value={String(llmCalls)} />
      <Stat label="Tool Calls" value={String(toolCalls)} />
      <Stat label="Tokens" value={String(totalTokens)} />

      <div className="col-span-2 rounded-lg border p-4 md:col-span-5">
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${
              hasError ? "bg-destructive" : "bg-foreground"
            }`}
          />

          <span className="text-sm font-medium">
            {hasError ? "ERROR" : "OK"}
          </span>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>
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