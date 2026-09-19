"use client";

import { useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import type { AgentAnalytics } from "@/lib/api/analytics";

interface AgentDetailSheetProps {
  agent: AgentAnalytics | null;
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

export function AgentDetailSheet({
  agent,
  open,
  onOpenChange,
}: AgentDetailSheetProps) {
  if (!agent) {
    return null;
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
    >
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-xl"
      >
        <SheetHeader className="pr-8">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border bg-muted/40">
              <Activity className="size-4 text-muted-foreground" />
            </div>

            <SheetTitle>{agent.name}</SheetTitle>
          </div>

          <SheetDescription>
            Agent execution performance for the selected period.
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
                Execution volume and reliability.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="Runs"
                value={agent.runs.toLocaleString()}
                icon={Activity}
              />

              <Metric
                label="Success rate"
                value={`${agent.successRate.toFixed(2)}%`}
                icon={CheckCircle2}
              />

              <Metric
                label="Successful"
                value={agent.successfulRuns.toLocaleString()}
                icon={CheckCircle2}
              />

              <Metric
                label="Failed"
                value={agent.failedRuns.toLocaleString()}
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
                Execution duration distribution.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Metric
                label="Average"
                value={formatDuration(agent.avgDuration)}
                icon={Clock3}
              />

              <Metric
                label="Minimum"
                value={formatDuration(agent.minDuration)}
                icon={BarChart3}
              />

              <Metric
                label="P50"
                value={formatDuration(agent.p50Duration)}
                icon={BarChart3}
              />

              <Metric
                label="P95"
                value={formatDuration(agent.p95Duration)}
                icon={BarChart3}
              />
            </div>
          </section>

          <Separator />

          {/* Observed range */}

          <section className="space-y-3">
            <div>
              <h3 className="text-sm font-medium">
                Observed activity
              </h3>

              <p className="text-xs text-muted-foreground">
                First and most recent execution observed by Terrax.
              </p>
            </div>

            <div className="space-y-3 rounded-md border p-4">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  First seen
                </span>

                <span className="text-sm font-medium">
                  {formatDate(agent.firstSeen)}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-muted-foreground">
                  Last seen
                </span>

                <span className="text-sm font-medium">
                  {formatDate(agent.lastSeen)}
                </span>
              </div>
            </div>
          </section>

          {/* Status */}

          <section className="rounded-md border bg-muted/20 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Execution status
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Based on recorded execution results.
                </p>
              </div>

              <Badge variant="outline">
                {agent.failedRuns === 0
                  ? "No failures"
                  : `${agent.failedRuns.toLocaleString()} failures`}
              </Badge>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}