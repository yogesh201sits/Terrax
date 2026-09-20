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
      <div className="rounded-xl border border-border/60 bg-card p-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
        <div className="mx-auto flex size-10 items-center justify-center rounded-xl border bg-muted/40 text-muted-foreground shadow-sm">
          <Activity className="size-4" />
        </div>

        <p className="mt-3 text-sm font-medium">
          No timeline data available
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Span execution information will appear here.
        </p>
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
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-[0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.6)]">
      {/* Header */}
      <div className="border-b border-border/60 bg-muted/[0.18] px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
                <Activity className="size-3.5 text-muted-foreground" />

              <h2 className="text-sm font-semibold tracking-tight">
                Timeline
              </h2>
            </div>

            <p className="mt-1.5 pl-9 text-xs text-muted-foreground">
              Span execution over time
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Success
            </div>

            <div className="hidden items-center gap-1.5 text-[10px] text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-red-500" />
              Error
            </div>

            <Badge
              variant="secondary"
              className="h-6 rounded-md border bg-background px-2 text-[10px] font-medium shadow-sm"
            >
              {spans.length} {spans.length === 1 ? "span" : "spans"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto">
        <div className="min-w-[960px] p-5">
          <TimelineHeader
            totalDuration={totalDuration}
          />

          <div className="mt-2 space-y-1.5">
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

      {/* Footer */}
      <div className="border-t border-border/50 bg-muted/[0.12] px-5 py-2.5">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>
            Total duration{" "}
            <span className="font-medium text-foreground">
              {formatDuration(totalDuration)}
            </span>
          </span>

          <span>
            {spans.filter(
              (item) => Boolean(item.node.span.errorMessage),
            ).length}{" "}
            errors
          </span>
        </div>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Timeline Header                                                            */
/* ========================================================================== */

function TimelineHeader({
  totalDuration,
}: {
  totalDuration: number;
}) {
  const points = [0, 25, 50, 75, 100];

  return (
    <div className="flex">
      <div className="w-[340px] shrink-0" />

      <div className="relative h-7 flex-1 border-b border-border/40">
        {points.map((point) => {
          const time = (totalDuration * point) / 100;

          return (
            <span
              key={point}
              className="absolute -translate-x-1/2 text-[9px] font-medium tabular-nums text-muted-foreground"
              style={{
                left: `${point}%`,
              }}
            >
              {formatTimelineTime(time)}
            </span>
          );
        })}
      </div>

      <div className="w-16 shrink-0" />
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
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  const { span } = item.node;

  const spanStart = new Date(span.startTime).getTime();
  const start = spanStart - traceStart;

  const duration = Math.max(span.durationMs, 1);

  const left = Math.max(
    0,
    Math.min(100, (start / totalDuration) * 100),
  );

  const width = Math.max(
    0.7,
    Math.min(
      100 - left,
      (duration / totalDuration) * 100,
    ),
  );

  const percentage = (duration / totalDuration) * 100;

  const isError = Boolean(span.errorMessage);

  const hasChildren = item.node.children.length > 0;

  const typeConfig = getTypeConfig(span.type);
  const TypeIcon = typeConfig.icon;

  return (
    <div
      className={[
        "group rounded-lg transition-all duration-150",
        hovered ? "bg-muted/[0.35]" : "bg-transparent",
      ].join(" ")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Main row */}
      <div className="flex min-h-12 items-center">
        {/* Span information */}
        <div
          className="flex w-[340px] shrink-0 items-center gap-2.5 pr-5"
          style={{
            paddingLeft: `${item.depth * 18}px`,
          }}
        >
          {/* Expand */}
          {hasChildren ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className={[
                "flex size-5 shrink-0 items-center justify-center rounded-md",
                "border border-transparent transition-all",
                "hover:border-border hover:bg-background hover:shadow-sm",
                "focus:outline-none focus:ring-2 focus:ring-ring/30",
              ].join(" ")}
              aria-label={
                expanded ? "Collapse span" : "Expand span"
              }
            >
              {expanded ? (
                <ChevronDown className="size-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="size-3.5 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="size-5 shrink-0" />
          )}

          {/* Type icon — completely neutral */}
          {/* <div
            className={[
              "flex size-6 shrink-0 items-center justify-center",
              "rounded-md",
              "border border-border/50",
              "bg-background/80",
              "shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_1px_2px_rgba(0,0,0,0.04)]",
              "transition-all duration-150",
              hovered
                ? "border-border shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_2px_4px_rgba(0,0,0,0.06)]"
                : "",
            ].join(" ")}
          >
            <TypeIcon className="size-3.5 text-muted-foreground" />
          </div> */}
          {/* Type icon */}
          <TypeIcon className="size-3.5 shrink-0 text-muted-foreground" />

          {/* Name */}
          <div className="min-w-0 flex-1">
            <Tooltip>
              <TooltipTrigger>
                <div className="cursor-default truncate text-left text-[11px] font-semibold tracking-tight">
                  {span.name}
                </div>
              </TooltipTrigger>

              <TooltipContent
                side="top"
                className="max-w-sm"
              >
                <p className="break-words text-xs">
                  {span.name}
                </p>
              </TooltipContent>
            </Tooltip>

            <div className="mt-1 flex items-center gap-1.5 text-[9px] tabular-nums text-muted-foreground">
              <span>{formatDuration(duration)}</span>

              <span className="text-border">•</span>

              <span>{percentage.toFixed(1)}%</span>

              {item.depth > 0 && (
                <>
                  <span className="text-border">•</span>

                  <span>depth {item.depth}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div
          className={[
            "relative h-10 flex-1 rounded-md",
            "border border-border/40",
            "bg-muted/[0.16]",
            "shadow-[inset_0_1px_2px_rgba(0,0,0,0.025)]",
            "transition-all duration-150",
            hovered
              ? "border-border/60 bg-muted/[0.22]"
              : "",
          ].join(" ")}
        >
          <TimelineGrid />

          <Tooltip>
            <TooltipTrigger>
              <button
                type="button"
                aria-label={`View ${span.name}`}
                className={[
                  "absolute top-1/2 -translate-y-1/2",
                  "h-[18px] min-w-[4px]",
                  "rounded-[5px] border",
                  "transition-all duration-150",
                  "hover:h-[22px]",
                  "focus:outline-none focus:ring-2 focus:ring-ring/30",

                  isError
                    ? [
                        "border-red-600/30",
                        "bg-red-500",
                        "shadow-[0_2px_6px_rgba(239,68,68,0.25)]",
                      ].join(" ")
                    : [
                        "border-emerald-600/30",
                        "bg-emerald-500",
                        "shadow-[0_2px_6px_rgba(16,185,129,0.22)]",
                      ].join(" "),
                ].join(" ")}
                style={{
                  left: `${left}%`,
                  width: `${width}%`,
                }}
                onClick={() =>
                  setExpanded((value) => !value)
                }
              />
            </TooltipTrigger>

            <TooltipContent
              side="top"
              className="w-72 max-w-72 p-3"
            >
              <div className="space-y-2.5">
                {/* Tooltip heading */}
                <div className="flex items-center gap-2">
                  <span
                    className={[
                      "size-2 rounded-full",
                      isError
                        ? "bg-red-500"
                        : "bg-emerald-500",
                    ].join(" ")}
                  />

                  <span className="truncate text-xs font-semibold">
                    {span.name}
                  </span>
                </div>

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
                  <span className="text-muted-foreground">
                    Type
                  </span>

                  <span className="truncate font-medium">
                    {span.type}
                  </span>

                  <span className="text-muted-foreground">
                    Duration
                  </span>

                  <span className="font-medium">
                    {formatDuration(duration)}
                  </span>

                  <span className="text-muted-foreground">
                    Trace %
                  </span>

                  <span className="font-medium">
                    {percentage.toFixed(1)}%
                  </span>

                  <span className="text-muted-foreground">
                    Offset
                  </span>

                  <span className="font-medium">
                    +{formatTimelineTime(start)}
                  </span>

                  <span className="text-muted-foreground">
                    Status
                  </span>

                  <span
                    className={
                      isError
                        ? "font-medium text-red-600 dark:text-red-400"
                        : "font-medium text-emerald-600 dark:text-emerald-400"
                    }
                  >
                    {isError ? "Error" : "Success"}
                  </span>
                </div>

                {/* Error */}
                {span.errorMessage && (
                  <CompactError
                    message={span.errorMessage}
                  />
                )}
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Duration label */}
          {width > 3 && (
            <span
              className={[
                "pointer-events-none absolute top-1/2 ml-2",
                "-translate-y-1/2",
                "whitespace-nowrap",
                "text-[9px] font-medium tabular-nums",
                hovered
                  ? "text-foreground"
                  : "text-muted-foreground",
              ].join(" ")}
              style={{
                left: `${Math.min(left + width, 90)}%`,
              }}
            >
              {formatDuration(duration)}
            </span>
          )}
        </div>

        {/* Status */}
        <div className="flex w-16 shrink-0 justify-end pl-3">
          {isError ? (
            <Badge
              className={[
                "h-5 gap-1 rounded-md",
                "border border-red-500/20",
                "bg-red-500/10",
                "px-1.5",
                "text-[9px] font-semibold",
                "text-red-600",
                "hover:bg-red-500/10",
                "dark:text-red-400",
              ].join(" ")}
            >
              <X className="size-2.5" />
              Error
            </Badge>
          ) : (
            <Badge
              className={[
                "h-5 gap-1 rounded-md",
                "border border-emerald-500/20",
                "bg-emerald-500/10",
                "px-1.5",
                "text-[9px] font-semibold",
                "text-emerald-600",
                "hover:bg-emerald-500/10",
                "dark:text-emerald-400",
              ].join(" ")}
            >
              <Check className="size-2.5" />
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
          startOffset={start}
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
      {[25, 50, 75].map((position) => (
        <div
          key={position}
          className="pointer-events-none absolute inset-y-0 border-l border-border/35"
          style={{
            left: `${position}%`,
          }}
        />
      ))}

      <div className="pointer-events-none absolute inset-y-0 left-0 border-l border-border/50" />

      <div className="pointer-events-none absolute inset-y-0 right-0 border-r border-border/40" />
    </>
  );
}

/* ========================================================================== */
/* Span Details                                                               */
/* ========================================================================== */

function SpanDetails({
  span,
  depth,
  startOffset,
}: {
  span: TraceTreeNode["span"];
  depth: number;
  startOffset: number;
}) {
  const isError = Boolean(span.errorMessage);

  return (
    <div
      className="mb-2 mt-1 rounded-lg border border-border/60 bg-muted/[0.18] p-4 shadow-[inset_0_1px_2px_rgba(0,0,0,0.025)]"
      style={{
        marginLeft: `${340 + depth * 18}px`,
        marginRight: "76px",
      }}
    >
      {/* Detail grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <DetailItem
          icon={<Activity className="size-3" />}
          label="Type"
          value={span.type}
        />

        <DetailItem
          icon={<Clock className="size-3" />}
          label="Duration"
          value={formatDuration(
            span.durationMs,
          )}
        />

        <DetailItem
          icon={<Clock className="size-3" />}
          label="Start offset"
          value={`+${formatTimelineTime(
            startOffset,
          )}`}
        />

        <DetailItem
          icon={
            isLlm(span.type) ? (
              <Bot className="size-3" />
            ) : (
              <GitBranch className="size-3" />
            )
          }
          label="Span ID"
          value={span.spanId}
          mono
        />

        <DetailItem
          icon={
            isError ? (
              <CircleAlert className="size-3" />
            ) : (
              <Check className="size-3" />
            )
          }
          label="Status"
          value={isError ? "Error" : "Success"}
          valueClassName={
            isError
              ? "text-red-600 dark:text-red-400"
              : "text-emerald-600 dark:text-emerald-400"
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
    <div className="mt-4 overflow-hidden rounded-lg border border-red-500/20 bg-red-500/[0.045]">
      <div className="flex items-center justify-between gap-3 border-b border-red-500/15 px-3 py-2">
        <div className="flex min-w-0 items-center gap-2 text-[10px] font-semibold text-red-600 dark:text-red-400">
          <div className="flex size-5 items-center justify-center rounded-md bg-red-500/10">
            <CircleAlert className="size-3" />
          </div>

          Error message
        </div>

        {isLong && (
          <button
            type="button"
            onClick={() =>
              setExpanded((value) => !value)
            }
            className="rounded-md border border-border/60 bg-background px-2 py-1 text-[9px] font-medium text-muted-foreground shadow-sm transition-colors hover:text-foreground"
          >
            {expanded
              ? "Show less"
              : "Show more"}
          </button>
        )}
      </div>

      <div
        className={[
          "px-3 py-2.5",
          expanded
            ? "max-h-64 overflow-auto"
            : "max-h-14 overflow-hidden",
        ].join(" ")}
      >
        <p
          className={[
            "break-words font-mono text-[10px] leading-relaxed text-muted-foreground",
            !expanded && "line-clamp-2",
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
    <div className="border-t border-border/50 pt-2">
      <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-semibold text-red-600 dark:text-red-400">
        <CircleAlert className="size-3" />
        Error
      </div>

      <p className="line-clamp-2 break-words font-mono text-[9px] leading-relaxed text-muted-foreground">
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
  valueClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-[9px] font-medium text-muted-foreground">
        {icon}
        {label}
      </div>

      <div
        className={[
          "mt-1.5 truncate text-[10px] font-semibold",
          mono ? "font-mono" : "",
          valueClassName ?? "",
        ].join(" ")}
      >
        {value}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Type Badge                                                                 */
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
      className={[
        "h-5 shrink-0 gap-1 rounded-md px-1.5",
        "border text-[8px] font-semibold",
        config.badge,
      ].join(" ")}
    >
      <Icon className="size-2.5" />
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
      badge:
        "border-violet-500/20 bg-violet-500/[0.07] text-violet-600 dark:text-violet-400",
      surface:
        "border-violet-500/20 bg-violet-500/[0.08]",
      iconColor:
        "text-violet-600 dark:text-violet-400",
    };
  }

  if (type === "workflow_node") {
    return {
      label: "Node",
      icon: Activity,
      badge:
        "border-blue-500/20 bg-blue-500/[0.07] text-blue-600 dark:text-blue-400",
      surface:
        "border-blue-500/20 bg-blue-500/[0.08]",
      iconColor:
        "text-blue-600 dark:text-blue-400",
    };
  }

  if (type === "llm") {
    return {
      label: "LLM",
      icon: Bot,
      badge:
        "border-amber-500/20 bg-amber-500/[0.07] text-amber-600 dark:text-amber-400",
      surface:
        "border-amber-500/20 bg-amber-500/[0.08]",
      iconColor:
        "text-amber-600 dark:text-amber-400",
    };
  }

  if (type === "tool") {
    return {
      label: "Tool",
      icon: Wrench,
      badge:
        "border-cyan-500/20 bg-cyan-500/[0.07] text-cyan-600 dark:text-cyan-400",
      surface:
        "border-cyan-500/20 bg-cyan-500/[0.08]",
      iconColor:
        "text-cyan-600 dark:text-cyan-400",
    };
  }

  return {
    label: "Span",
    icon: Search,
    badge:
      "border-border bg-muted/50 text-muted-foreground",
    surface:
      "border-border bg-muted/40",
    iconColor: "text-muted-foreground",
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
