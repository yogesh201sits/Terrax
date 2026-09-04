"use client";

import {
  Activity,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock,
  GitBranch,
  Search,
  Wrench,
  X,
} from "lucide-react";

import { useState } from "react";

import type { TraceTreeNode } from "@/types/trace-detail";

import { Badge } from "@/components/ui/badge";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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

  const totalDuration = Math.max(
    traceEnd - traceStart,
    1,
  );

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold">
              Timeline
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Span execution over time
            </p>
          </div>

          <Badge variant="secondary">
            {spans.length}{" "}
            {spans.length === 1 ? "span" : "spans"}
          </Badge>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[900px] p-5">
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
      <div className="w-[320px] shrink-0" />

      <div className="relative h-7 flex-1">
        {points.map((point) => {
          const time =
            (totalDuration * point) / 100;

          return (
            <span
              key={point}
              className="absolute -translate-x-1/2 text-[10px] text-muted-foreground"
              style={{
                left: `${point}%`,
              }}
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
  const [expanded, setExpanded] =
    useState(false);

  const { span } = item.node;

  const start =
    new Date(span.startTime).getTime() -
    traceStart;

  const duration = Math.max(
    span.durationMs,
    1,
  );

  const left = Math.max(
    0,
    Math.min(
      100,
      (start / totalDuration) * 100,
    ),
  );

  const width = Math.max(
    0.8,
    Math.min(
      100 - left,
      (duration / totalDuration) * 100,
    ),
  );

  const percentage =
    (duration / totalDuration) * 100;

  const isError = Boolean(span.errorMessage);

  const hasChildren =
    item.node.children.length > 0;

  return (
    <div>
      <div className="flex items-center">
        {/* Span information */}
        <div
          className="flex w-[320px] shrink-0 items-center gap-2 pr-4"
          style={{
            paddingLeft: `${item.depth * 20}px`,
          }}
        >
          {/* Expand button */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() =>
                setExpanded(!expanded)
              }
              className="flex size-5 shrink-0 items-center justify-center rounded hover:bg-muted"
            >
              {expanded ? (
                <ChevronDown className="size-3.5" />
              ) : (
                <ChevronRight className="size-3.5" />
              )}
            </button>
          ) : (
            <div className="size-5 shrink-0" />
          )}

          {/* Span type */}
          <SpanTypeBadge
            type={span.type}
          />

          {/* Span name */}
          <div className="min-w-0 flex-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <div className="truncate text-xs font-medium">
                    {span.name}
                  </div>
                </TooltipTrigger>

                <TooltipContent>
                  <p>{span.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="mt-0.5 flex items-center gap-2 text-[10px] text-muted-foreground">
              <span>
                {formatDuration(duration)}
              </span>

              <span>·</span>

              <span>
                {percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="relative h-10 flex-1 rounded-md bg-muted/30">
          {/* Grid */}
          <TimelineGrid />

          {/* Span bar */}
          <TooltipProvider>
            <Tooltip>
             <TooltipTrigger>
                <div
                  className={[
                    "absolute top-1/2 h-5 -translate-y-1/2",
                    "cursor-pointer rounded-sm",
                    "transition-all hover:h-6",
                    isError
                      ? "bg-destructive"
                      : "bg-foreground",
                  ].join(" ")}
                  style={{
                    left: `${left}%`,
                    width: `${width}%`,
                  }}
                  onClick={() => setExpanded(!expanded)}
                />
              </TooltipTrigger>

              <TooltipContent className="w-64">
                <div className="space-y-2">
                  <div className="font-medium">
                    {span.name}
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <span className="text-muted-foreground">
                      Type
                    </span>

                    <span>{span.type}</span>

                    <span className="text-muted-foreground">
                      Duration
                    </span>

                    <span>
                      {formatDuration(
                        duration,
                      )}
                    </span>

                    <span className="text-muted-foreground">
                      Trace %
                    </span>

                    <span>
                      {percentage.toFixed(1)}%
                    </span>

                    <span className="text-muted-foreground">
                      Status
                    </span>

                    <span>
                      {isError
                        ? "Error"
                        : "OK"}
                    </span>
                  </div>

                  {span.errorMessage && (
                    <div className="border-t pt-2 text-xs text-destructive">
                      {span.errorMessage}
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Duration label */}
          <span
            className="absolute top-1/2 ml-2 -translate-y-1/2 whitespace-nowrap text-[10px] text-muted-foreground"
            style={{
              left: `${Math.min(
                left + width,
                92,
              )}%`,
            }}
          >
            {formatDuration(duration)}
          </span>
        </div>

        {/* Status */}
        <div className="flex w-16 shrink-0 justify-end">
          {isError ? (
            <Badge
              variant="destructive"
              className="gap-1 text-[10px]"
            >
              <X className="size-3" />
              Error
            </Badge>
          ) : (
            <Badge
              variant="secondary"
              className="gap-1 text-[10px]"
            >
              <Check className="size-3" />
              OK
            </Badge>
          )}
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <SpanDetails
          span={span}
          depth={item.depth}
        />
      )}
    </div>
  );
}

function TimelineGrid() {
  return (
    <>
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
    </>
  );
}

function SpanDetails({
  span,
  depth,
}: {
  span: TraceTreeNode["span"];
  depth: number;
}) {
  return (
    <div
      className="ml-[320px] mr-16 mt-1 rounded-md border bg-muted/20 p-4"
      style={{
        marginLeft: `${320 + depth * 20}px`,
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <DetailItem
          icon={<Activity className="size-3.5" />}
          label="Type"
          value={span.type}
        />

        <DetailItem
          icon={<Clock className="size-3.5" />}
          label="Duration"
          value={formatDuration(
            span.durationMs,
          )}
        />

        <DetailItem
          icon={
            isLlm(span.type) ? (
              <Bot className="size-3.5" />
            ) : (
              <GitBranch className="size-3.5" />
            )
          }
          label="Span ID"
          value={span.spanId}
          mono
        />

        <DetailItem
          icon={
            span.errorMessage ? (
              <CircleAlert className="size-3.5" />
            ) : (
              <Check className="size-3.5" />
            )
          }
          label="Status"
          value={
            span.errorMessage
              ? "Error"
              : "OK"
          }
        />
      </div>

      {span.errorMessage && (
        <div className="mt-4 rounded-md border border-destructive/30 bg-destructive/5 p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-destructive">
            <CircleAlert className="size-3.5" />
            Error
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            {span.errorMessage}
          </p>
        </div>
      )}
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </div>

      <div
        className={`mt-1 truncate text-xs font-medium ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function SpanTypeBadge({
  type,
}: {
  type: TraceTreeNode["span"]["type"];
}) {
  const config = getTypeConfig(type);

  return (
    <Badge
      variant="outline"
      className="h-5 shrink-0 gap-1 px-1.5 text-[9px] font-medium"
    >
      <config.icon className="size-3" />
      {config.label}
    </Badge>
  );
}

function getTypeConfig(
  type: TraceTreeNode["span"]["type"],
) {
  if (type === "workflow") {
    return {
      label: "Workflow",
      icon: GitBranch,
    };
  }

  if (type === "workflow_node") {
    return {
      label: "Node",
      icon: Activity,
    };
  }

  if (type === "llm") {
    return {
      label: "LLM",
      icon: Bot,
    };
  }

  if (type === "tool") {
    return {
      label: "Tool",
      icon: Wrench,
    };
  }

  return {
    label: "Span",
    icon: Search,
  };
}

function isLlm(
  type: TraceTreeNode["span"]["type"],
) {
  return type === "llm";
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
      new Date(
        a.node.span.startTime,
      ).getTime() -
      new Date(
        b.node.span.startTime,
      ).getTime()
    );
  });
}

function formatDuration(
  durationMs: number,
) {
  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }

  return `${(durationMs / 1000).toFixed(2)}s`;
}

function formatTimelineTime(
  durationMs: number,
) {
  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }

  return `${(durationMs / 1000).toFixed(1)}s`;
}
