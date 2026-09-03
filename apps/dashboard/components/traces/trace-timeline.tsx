"use client";

import type { TraceTreeNode } from "@/types/trace-detail";

type Props = {
  roots: TraceTreeNode[];
};

type TimelineSpan = {
  node: TraceTreeNode;
  depth: number;
};

export function TraceTimeline({ roots }: Props) {
  const spans = flattenTree(roots);

  if (spans.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center text-sm text-muted-foreground">
        No timeline data available.
      </div>
    );
  }

  const traceStart = Math.min(
    ...spans.map((item) =>
      new Date(item.node.span.startTime).getTime(),
    ),
  );

  const traceEnd = Math.max(
    ...spans.map((item) =>
      new Date(item.node.span.endTime).getTime(),
    ),
  );

  const totalDuration = Math.max(traceEnd - traceStart, 1);

  return (
    <div className="rounded-lg border">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold">Timeline</h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Span execution over time
        </p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px] p-5">
          <TimelineHeader
            traceStart={traceStart}
            totalDuration={totalDuration}
          />

          <div className="mt-3 space-y-2">
            {spans.map((item) => (
              <TimelineRow
                key={item.node.span.spanId}
                item={item}
                traceStart={traceStart}
                totalDuration={totalDuration}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineHeader({
  traceStart,
  totalDuration,
}: {
  traceStart: number;
  totalDuration: number;
}) {
  const points = [0, 25, 50, 75, 100];

  return (
    <div className="flex">
      <div className="w-[280px] shrink-0" />

      <div className="relative h-6 flex-1">
        {points.map((point) => {
          const time = (totalDuration * point) / 100;

          return (
            <span
              key={point}
              className="absolute -translate-x-1/2 text-[10px] text-muted-foreground"
              style={{ left: `${point}%` }}
            >
              {formatTimelineTime(time)}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function TimelineRow({
  item,
  traceStart,
  totalDuration,
}: {
  item: TimelineSpan;
  traceStart: number;
  totalDuration: number;
}) {
  const { span } = item.node;

  const start =
    new Date(span.startTime).getTime() - traceStart;

  const duration = Math.max(span.durationMs, 1);

  const left = Math.max(
    0,
    Math.min(100, (start / totalDuration) * 100),
  );

  const width = Math.max(
    0.8,
    Math.min(100 - left, (duration / totalDuration) * 100),
  );

  const isError = Boolean(span.errorMessage);

  return (
    <div className="flex items-center">
      <div
        className="flex w-[280px] shrink-0 items-center gap-2 pr-4"
        style={{
          paddingLeft: `${item.depth * 20}px`,
        }}
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded border text-[9px] font-semibold">
          {getTypeIcon(span.type)}
        </span>

        <span className="min-w-0 truncate text-xs font-medium">
          {span.name}
        </span>
      </div>

      <div className="relative h-8 flex-1 rounded bg-muted/40">
        <div
          className="absolute inset-y-0 border-l border-border/50"
          style={{ left: "25%" }}
        />

        <div
          className="absolute inset-y-0 border-l border-border/50"
          style={{ left: "50%" }}
        />

        <div
          className="absolute inset-y-0 border-l border-border/50"
          style={{ left: "75%" }}
        />

        <div
          className={`absolute top-1/2 h-4 -translate-y-1/2 rounded-sm ${
            isError ? "bg-destructive" : "bg-foreground"
          }`}
          style={{
            left: `${left}%`,
            width: `${width}%`,
          }}
          title={`${span.name} — ${formatDuration(duration)}`}
        />

        <span
          className="absolute top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap text-[10px] text-muted-foreground"
          style={{
            left: `${Math.min(left + width, 94)}%`,
          }}
        >
          {formatDuration(duration)}
        </span>
      </div>
    </div>
  );
}

function flattenTree(
  roots: TraceTreeNode[],
): TimelineSpan[] {
  const result: TimelineSpan[] = [];

  function visit(
    node: TraceTreeNode,
    depth: number,
  ) {
    result.push({
      node,
      depth,
    });

    for (const child of node.children) {
      visit(child, depth + 1);
    }
  }

  for (const root of roots) {
    visit(root, 0);
  }

  return result.sort((a, b) => {
    return (
      new Date(a.node.span.startTime).getTime() -
      new Date(b.node.span.startTime).getTime()
    );
  });
}

function getTypeIcon(
  type: TraceTreeNode["span"]["type"],
) {
  if (type === "workflow") {
    return "W";
  }

  if (type === "workflow_node") {
    return "N";
  }

  if (type === "llm") {
    return "L";
  }

  if (type === "tool") {
    return "T";
  }

  return "S";
}

function formatDuration(durationMs: number) {
  if (durationMs < 1000) {
    return `${durationMs}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}

function formatTimelineTime(durationMs: number) {
  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }

  return `${(durationMs / 1000).toFixed(1)}s`;
}