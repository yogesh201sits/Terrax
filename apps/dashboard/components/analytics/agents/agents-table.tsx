"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Check,
  Clock3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import type { AgentAnalytics } from "@/lib/api/analytics";
import { AgentDetailSheet } from "./agent-detail-sheet";

interface AgentsTableProps {
  agents: AgentAnalytics[];
}

type SortKey =
  | "runs"
  | "successRate"
  | "avgDuration"
  | "p95Duration"
  | "lastSeen";

type SortDirection = "asc" | "desc";

const sortOptions: {
  value: SortKey;
  label: string;
}[] = [
  { value: "runs", label: "Runs" },
  { value: "successRate", label: "Success rate" },
  { value: "avgDuration", label: "Average duration" },
  { value: "p95Duration", label: "P95 duration" },
  { value: "lastSeen", label: "Last seen" },
];

function formatDuration(ms: number) {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }

  return `${(ms / 1000).toFixed(1)}s`;
}

function formatLastSeen(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const diff = Date.now() - date.getTime();

  if (diff < 60_000) {
    return "Just now";
  }

  if (diff < 60 * 60_000) {
    return `${Math.floor(diff / 60_000)}m ago`;
  }

  if (diff < 24 * 60 * 60_000) {
    return `${Math.floor(diff / (60 * 60_000))}h ago`;
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function AgentsTable({
  agents,
}: AgentsTableProps) {
  const [selectedAgent, setSelectedAgent] =
    useState<AgentAnalytics | null>(null);

  const [sortKey, setSortKey] =
    useState<SortKey>("runs");

  const [sortDirection, setSortDirection] =
    useState<SortDirection>("desc");

  const sortedAgents = useMemo(() => {
    return [...agents].sort((a, b) => {
      let comparison = 0;

      switch (sortKey) {
        case "runs":
          comparison = a.runs - b.runs;
          break;

        case "successRate":
          comparison =
            a.successRate - b.successRate;
          break;

        case "avgDuration":
          comparison =
            a.avgDuration - b.avgDuration;
          break;

        case "p95Duration":
          comparison =
            a.p95Duration - b.p95Duration;
          break;

        case "lastSeen":
          comparison =
            new Date(a.lastSeen).getTime() -
            new Date(b.lastSeen).getTime();
          break;
      }

      return sortDirection === "asc"
        ? comparison
        : -comparison;
    });
  }, [agents, sortKey, sortDirection]);

  function handleSortChange(value: string) {
    const nextKey = value as SortKey;

    if (nextKey === sortKey) {
      setSortDirection((current) =>
        current === "desc" ? "asc" : "desc",
      );
      return;
    }

    setSortKey(nextKey);
    setSortDirection("desc");
  }

  if (agents.length === 0) {
    return (
      <Card className="rounded-lg border shadow-none">
        <CardHeader className="px-5 py-4">
          <CardTitle className="text-sm font-medium">
            Agent Performance
          </CardTitle>
        </CardHeader>

        <CardContent className="px-5 pb-5">
          <div className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
            No agent activity found.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="rounded-lg border shadow-none">
        <CardHeader className="flex flex-row items-center justify-between px-5 py-4">
          <div>
            <CardTitle className="text-sm font-medium">
              Agent Performance
            </CardTitle>

            <p className="mt-1 text-xs text-muted-foreground">
              Execution and latency metrics across agents
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 text-xs"
                >
                  <ArrowUpDown className="size-3.5" />
                  Sort
                </Button>
              }
            />

            <DropdownMenuContent
              align="end"
              className="w-52"
            >
              <DropdownMenuRadioGroup
                value={sortKey}
                onValueChange={handleSortChange}
              >
                {sortOptions.map((option) => (
                  <DropdownMenuRadioItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}

                    {option.value === sortKey && (
                      <span className="ml-auto text-xs text-muted-foreground">
                        {sortDirection === "desc"
                          ? "High"
                          : "Low"}
                      </span>
                    )}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="h-10 pl-5">
                    Agent
                  </TableHead>

                  <TableHead className="h-10">
                    Runs
                  </TableHead>

                  <TableHead className="h-10">
                    Success
                  </TableHead>

                  <TableHead className="h-10">
                    Avg
                  </TableHead>

                  <TableHead className="h-10">
                    P50
                  </TableHead>

                  <TableHead className="h-10">
                    P95
                  </TableHead>

                  <TableHead className="h-10">
                    Last seen
                  </TableHead>

                  <TableHead className="h-10 pr-5 text-right">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedAgents.map((agent) => (
                  <TableRow
                    key={agent.name}
                    className="cursor-pointer"
                    onClick={() =>
                      setSelectedAgent(agent)
                    }
                  >
                    <TableCell className="py-3 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="flex size-7 shrink-0 items-center justify-center rounded-md border bg-muted/40">
                          <Clock3 className="size-3.5 text-muted-foreground" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {agent.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {agent.runs.toLocaleString()} executions
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="font-medium">
                      {agent.runs.toLocaleString()}
                    </TableCell>

                    <TableCell>
                      {agent.successRate.toFixed(2)}%
                    </TableCell>

                    <TableCell>
                      {formatDuration(agent.avgDuration)}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatDuration(agent.p50Duration)}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatDuration(agent.p95Duration)}
                    </TableCell>

                    <TableCell className="text-muted-foreground">
                      {formatLastSeen(agent.lastSeen)}
                    </TableCell>

                    <TableCell className="pr-5 text-right">
                      <span className="text-xs text-muted-foreground">
                        {agent.failedRuns > 0
                          ? `${agent.failedRuns.toLocaleString()} failed`
                          : "Healthy"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AgentDetailSheet
        agent={selectedAgent}
        open={selectedAgent !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAgent(null);
          }
        }}
      />
    </>
  );
}
