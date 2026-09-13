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

export function TraceTimeline({
  roots,
}: Props) {
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
      new Date(
        item.node.span.startTime,
      ).getTime(),
    ),
  );

  const traceEnd = Math.max(
    ...spans.map((item) =>
      new Date(
        item.node.span.endTime,
      ).getTime(),
    ),
  );

  const totalDuration = Math.max(
    traceEnd - traceStart,
    1,
  );

  return (
    <div className="rounded-lg border bg-card">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                           */}
      {/* ---------------------------------------------------------------- */}

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
            {spans.length === 1
              ? "span"
              : "spans"}
          </Badge>

        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Timeline                                                         */}
      {/* ---------------------------------------------------------------- */}

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

/* ========================================================================== */
/* Timeline Header                                                            */
/* ========================================================================== */

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

/* ========================================================================== */
/* Timeline Row                                                               */
/* ========================================================================== */

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

  const isError =
    Boolean(span.errorMessage);

  const hasChildren =
    item.node.children.length > 0;

  return (
    <div>
      {/* ---------------------------------------------------------------- */}
      {/* Main Row                                                         */}
      {/* ---------------------------------------------------------------- */}

      <div className="flex items-center">

        {/* Span information */}
        <div
          className="flex w-[320px] shrink-0 items-center gap-2 pr-4"
          style={{
            paddingLeft:
              `${item.depth * 20}px`,
          }}
        >

          {/* Expand */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() =>
                setExpanded(!expanded)
              }
              className="flex size-5 shrink-0 items-center justify-center rounded hover:bg-muted"
              aria-label={
                expanded
                  ? "Collapse span"
                  : "Expand span"
              }
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

          {/* Type */}
          <SpanTypeBadge
            type={span.type}
          />

          {/* Name */}
          <div className="min-w-0 flex-1">

            <TooltipProvider>
              <Tooltip>

                <TooltipTrigger>
                  <div className="truncate text-xs font-medium">
                    {span.name}
                  </div>
                </TooltipTrigger>

                <TooltipContent>
                  <p className="max-w-sm break-words">
                    {span.name}
                  </p>
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

        {/* ---------------------------------------------------------------- */}
        {/* Timeline Bar                                                     */}
        {/* ---------------------------------------------------------------- */}

        <div className="relative h-10 flex-1 rounded-md bg-muted/30">

          <TimelineGrid />

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

              {/* -------------------------------------------------------- */}
              {/* Compact Tooltip                                           */}
              {/* -------------------------------------------------------- */}

              <TooltipContent className="w-72 max-w-72">
                <div className="space-y-2">

                  <div className="break-words font-medium">
                    {span.name}
                  </div>

                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">

                    <span className="text-muted-foreground">
                      Type
                    </span>

                    <span className="truncate">
                      {span.type}
                    </span>

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

                    <span
                      className={
                        isError
                          ? "text-destructive"
                          : undefined
                      }
                    >
                      {isError
                        ? "Error"
                        : "OK"}
                    </span>

                  </div>

                  {/* Compact error */}
                  {span.errorMessage && (
                    <CompactError
                      message={
                        span.errorMessage
                      }
                    />
                  )}

                </div>
              </TooltipContent>

            </Tooltip>
          </TooltipProvider>

          {/* Duration */}
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

        {/* ---------------------------------------------------------------- */}
        {/* Status                                                           */}
        {/* ---------------------------------------------------------------- */}

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

      {/* ---------------------------------------------------------------- */}
      {/* Expanded Details                                                 */}
      {/* ---------------------------------------------------------------- */}

      {expanded && (
        <SpanDetails
          span={span}
          depth={item.depth}
        />
      )}

    </div>
  );
}

/* ========================================================================== */
/* Timeline Grid                                                              */
/* ========================================================================== */

function TimelineGrid() {
  return (
    <>
      <div
        className="absolute inset-y-0 border-l border-border/50"
        style={{
          left: "25%",
        }}
      />

      <div
        className="absolute inset-y-0 border-l border-border/50"
        style={{
          left: "50%",
        }}
      />

      <div
        className="absolute inset-y-0 border-l border-border/50"
        style={{
          left: "75%",
        }}
      />
    </>
  );
}

/* ========================================================================== */
/* Span Details                                                               */
/* ========================================================================== */

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
        marginLeft:
          `${320 + depth * 20}px`,
      }}
    >
      {/* Metadata */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <DetailItem
          icon={
            <Activity className="size-3.5" />
          }
          label="Type"
          value={span.type}
        />

        <DetailItem
          icon={
            <Clock className="size-3.5" />
          }
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

      {/* Error */}
      {span.errorMessage && (
        <ErrorMessage
          message={span.errorMessage}
        />
      )}
    </div>
  );
}

/* ========================================================================== */
/* Error Message                                                              */
/* ========================================================================== */

function ErrorMessage({
  message,
}: {
  message: string;
}) {
  const [expanded, setExpanded] =
    useState(false);

  const isLong = message.length > 180;

  return (
    <div className="mt-4 overflow-hidden rounded-md border border-destructive/30 bg-destructive/5">

      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-destructive/20 px-3 py-2">

        <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-destructive">

          <CircleAlert className="size-3.5 shrink-0" />

          <span>
            Error
          </span>

        </div>

        {isLong && (
          <button
            type="button"
            onClick={() =>
              setExpanded(!expanded)
            }
            className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {expanded
              ? "Show less"
              : "Show more"}
          </button>
        )}

      </div>

      {/* Message */}
      <div
        className={[
          "px-3 py-2",
          expanded
            ? "max-h-56 overflow-auto"
            : "max-h-11 overflow-hidden",
        ].join(" ")}
      >
        <p
          className={[
            "break-words font-mono text-[11px] leading-relaxed text-muted-foreground",
            !expanded &&
              "line-clamp-2",
          ].join(" ")}
        >
          {message}
        </p>
      </div>

    </div>
  );
}

/* ========================================================================== */
/* Compact Tooltip Error                                                      */
/* ========================================================================== */

function CompactError({
  message,
}: {
  message: string;
}) {
  return (
    <div className="border-t pt-2">

      <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium text-destructive">

        <CircleAlert className="size-3" />

        Error

      </div>

      <p className="line-clamp-2 break-words font-mono text-[10px] leading-relaxed text-muted-foreground">
        {message}
      </p>

    </div>
  );
}

/* ========================================================================== */
/* Detail Item                                                                */
/* ========================================================================== */

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
    <div className="min-w-0">

      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        {icon}
        {label}
      </div>

      <div
        className={[
          "mt-1 truncate text-xs font-medium",
          mono ? "font-mono" : "",
        ].join(" ")}
      >
        {value}
      </div>

    </div>
  );
}

/* ========================================================================== */
/* Span Type Badge                                                            */
/* ========================================================================== */

function SpanTypeBadge({
  type,
}: {
  type: TraceTreeNode["span"]["type"];
}) {
  const config = getTypeConfig(type);

  const Icon = config.icon;

  return (
    <Badge
      variant="outline"
      className="h-5 shrink-0 gap-1 px-1.5 text-[9px] font-medium"
    >
      <Icon className="size-3" />

      {config.label}
    </Badge>
  );
}

/* ========================================================================== */
/* Type Config                                                                */
/* ========================================================================== */

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

/* ========================================================================== */
/* Helpers                                                                    */
/* ========================================================================== */

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

  if (durationMs < 60_000) {
    return `${(durationMs / 1000).toFixed(2)}s`;
  }

  const minutes = Math.floor(
    durationMs / 60_000,
  );

  const seconds =
    (durationMs % 60_000) / 1000;

  return `${minutes}m ${seconds.toFixed(1)}s`;
}

function formatTimelineTime(
  durationMs: number,
) {
  if (durationMs < 1000) {
    return `${Math.round(durationMs)}ms`;
  }

  if (durationMs < 60_000) {
    return `${(durationMs / 1000).toFixed(1)}s`;
  }

  const minutes = Math.floor(
    durationMs / 60_000,
  );

  const seconds =
    (durationMs % 60_000) / 1000;

  return `${minutes}m ${seconds.toFixed(1)}s`;
}
