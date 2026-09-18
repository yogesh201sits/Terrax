import {
  Activity,
  Bot,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { AnalyticsStat } from "@/components/analytics/analytics-stat";

interface AgentsStatsProps {
  totalAgents: number;
  totalRuns: number;
  successRate: number;
  avgDuration: number;
}

function formatDuration(ms: number) {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }

  return `${(ms / 1000).toFixed(1)}s`;
}

export function AgentsStats({
  totalAgents,
  totalRuns,
  successRate,
  avgDuration,
}: AgentsStatsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <AnalyticsStat
        label="Total Agents"
        value={totalAgents.toLocaleString()}
        description="Active in selected period"
        icon={Bot}
      />

      <AnalyticsStat
        label="Total Runs"
        value={totalRuns.toLocaleString()}
        description="Agent executions"
        icon={Activity}
      />

      <AnalyticsStat
        label="Success Rate"
        value={`${successRate.toFixed(2)}%`}
        description="Successful executions"
        icon={CheckCircle2}
      />

      <AnalyticsStat
        label="Avg Duration"
        value={formatDuration(avgDuration)}
        description="Across all runs"
        icon={Clock3}
      />
    </div>
  );
}