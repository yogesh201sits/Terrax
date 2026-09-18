import {
  Activity,
  CheckCircle2,
  Clock3,
  Wrench,
} from "lucide-react";

import { AnalyticsStat } from "@/components/analytics/analytics-stat";

interface ToolsStatsProps {
  totalTools: number;
  totalCalls: number;
  successRate: number;
  avgDuration: number;
}

function formatDuration(ms: number) {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`;
  }

  return `${(ms / 1000).toFixed(1)}s`;
}

export function ToolsStats({
  totalTools,
  totalCalls,
  successRate,
  avgDuration,
}: ToolsStatsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AnalyticsStat
        label="Tools"
        value={totalTools.toLocaleString()}
        icon={Wrench}
      />

      <AnalyticsStat
        label="Calls"
        value={totalCalls.toLocaleString()}
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