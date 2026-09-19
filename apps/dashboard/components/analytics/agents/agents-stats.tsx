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
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AnalyticsStat
        label="Agents"
        value={totalAgents.toLocaleString()}
        icon={Bot}
      />

      <AnalyticsStat
        label="Runs"
        value={totalRuns.toLocaleString()}
        icon={Activity}
      />

      <AnalyticsStat
        label="Success Rate"
        value={`${successRate.toFixed(2)}%`}
        icon={CheckCircle2}
      />

      <AnalyticsStat
        label="Avg Duration"
        value={formatDuration(avgDuration)}
        icon={Clock3}
      />
    </div>
  );
}