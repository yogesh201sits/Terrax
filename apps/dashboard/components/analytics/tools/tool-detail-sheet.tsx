"use client";

import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  Wrench,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import type { ToolAnalytics } from "@/lib/api/analytics";

interface ToolDetailSheetProps {
  tool: ToolAnalytics | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDuration(ms: number) {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }

  return `${(ms / 1000).toFixed(2)}s`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Activity;
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </div>

      <p className="mt-2 text-lg font-semibold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function LatencyScale({
  tool,
}: {
  tool: ToolAnalytics;
}) {
  const min = Math.max(tool.minDuration, 0);
  const max = Math.max(tool.maxDuration, min);

  const range = Math.max(max - min, 1);

  function position(value: number) {
    return Math.min(
      100,
      Math.max(
        0,
        ((value - min) / range) * 100,
      ),
    );
  }

  const markers = [
    {
      label: "Min",
      value: tool.minDuration,
      position: position(tool.minDuration),
    },
    {
      label: "P50",
      value: tool.p50Duration,
      position: position(tool.p50Duration),
    },
    {
      label: "Avg",
      value: tool.avgDuration,
      position: position(tool.avgDuration),
    },
    {
      label: "P95",
      value: tool.p95Duration,
      position: position(tool.p95Duration),
    },
    {
      label: "Max",
      value: tool.maxDuration,
      position: position(tool.maxDuration),
    },
  ];

  return (
    <div className="rounded-md border p-4">
      <div className="mb-6">
        <p className="text-sm font-medium">
          Latency distribution
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          Observed execution duration across tool calls.
        </p>
      </div>

      <div className="relative px-1">
        <div className="h-1 rounded-full bg-muted" />

        {markers.map((marker) => (
          <div
            key={marker.label}
            className="absolute top-1/2 -translate-y-1/2"
            style={{
              left: `${marker.position}%`,
            }}
          >
            <div className="size-2.5 -translate-x-1/2 rounded-full border-2 border-background bg-foreground" />
          </div>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-5 gap-2">
        {markers.map((marker) => (
          <div
            key={marker.label}
            className="min-w-0"
          >
            <p className="text-[11px] text-muted-foreground">
              {marker.label}
            </p>

            <p className="mt-0.5 truncate text-xs font-medium">
              {formatDuration(marker.value)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ToolDetailSheet({
  tool,
  open,
  onOpenChange,
}: ToolDetailSheetProps) {
  if (!tool) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-xl"
      >
        <SheetHeader className="pr-8">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border bg-muted/40">
              <Wrench className="size-4 text-muted-foreground" />
            </div>

            <SheetTitle className="truncate">
              {tool.name}
            </SheetTitle>
          </div>

          <SheetDescription>
            Tool execution analysis for the selected period.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-4 pb-6">
          {/* Overview */}
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">
                Overview
              </h3>

              <p className="text-xs text-muted-foreground">
                Usage and reliability across recorded calls.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="Calls"
                value={tool.calls.toLocaleString()}
                icon={Activity}
              />

              <Metric
                label="Success rate"
                value={`${tool.successRate.toFixed(2)}%`}
                icon={CheckCircle2}
              />

              <Metric
                label="Successful"
                value={tool.successfulCalls.toLocaleString()}
                icon={CheckCircle2}
              />

              <Metric
                label="Failed"
                value={tool.failedCalls.toLocaleString()}
                icon={XCircle}
              />
            </div>
          </section>

          <Separator />

          {/* Latency */}
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">
                Latency
              </h3>

              <p className="text-xs text-muted-foreground">
                Execution duration across the selected period.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="Average"
                value={formatDuration(tool.avgDuration)}
                icon={Clock3}
              />

              <Metric
                label="Minimum"
                value={formatDuration(tool.minDuration)}
                icon={BarChart3}
              />

              <Metric
                label="P50"
                value={formatDuration(tool.p50Duration)}
                icon={BarChart3}
              />

              <Metric
                label="P95"
                value={formatDuration(tool.p95Duration)}
                icon={BarChart3}
              />
            </div>

            <LatencyScale tool={tool} />

            <div className="rounded-md border p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Maximum observed duration
                </span>

                <span className="text-sm font-medium">
                  {formatDuration(tool.maxDuration)}
                </span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Reliability */}
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">
                Reliability
              </h3>

              <p className="text-xs text-muted-foreground">
                Success and failure distribution.
              </p>
            </div>

            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Successful calls
                </span>

                <span className="text-sm font-medium">
                  {tool.successfulCalls.toLocaleString()}
                </span>
              </div>

              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-foreground"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.max(
                        0,
                        tool.successRate,
                      ),
                    )}%`,
                  }}
                />
              </div>

              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {tool.failedCalls.toLocaleString()} failed
                </span>

                <span>
                  {tool.successRate.toFixed(2)}% success
                </span>
              </div>
            </div>
          </section>

          <Separator />

          {/* Activity */}
          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">
                Observed activity
              </h3>

              <p className="text-xs text-muted-foreground">
                First and most recent activity observed by Terrax.
              </p>
            </div>

            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  First seen
                </span>

                <span className="text-sm font-medium text-right">
                  {formatDate(tool.firstSeen)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Last seen
                </span>

                <span className="text-sm font-medium text-right">
                  {formatDate(tool.lastSeen)}
                </span>
              </div>
            </div>
          </section>

          {/* Status */}
          <section className="rounded-md border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium">
                  Current status
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Based on recorded executions.
                </p>
              </div>

              <Badge variant="outline">
                {tool.failedCalls === 0
                  ? "Healthy"
                  : `${tool.failedCalls.toLocaleString()} failures`}
              </Badge>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}