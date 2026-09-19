import { auth } from "@clerk/nextjs/server";

import { AnalyticsHeader } from "@/components/analytics/analytics-header";
import { AnalyticsTrend } from "@/components/analytics/analytics-trend";
import { ToolsStats } from "@/components/analytics/tools/tools-stats";
import { ToolsTable } from "@/components/analytics/tools/tools-table";

import {
  getToolAnalytics,
  type AnalyticsRange,
} from "@/lib/api/analytics";

import { getProjects } from "@/lib/api/projects";

interface ToolsPageProps {
  searchParams: Promise<{
    projectId?: string;
    range?: string;
  }>;
}

const VALID_RANGES: AnalyticsRange[] = [
  "24h",
  "7d",
  "30d",
  "all",
];

function getRange(value?: string): AnalyticsRange {
  if (
    value &&
    VALID_RANGES.includes(value as AnalyticsRange)
  ) {
    return value as AnalyticsRange;
  }

  return "24h";
}

export default async function ToolsPage({
  searchParams,
}: ToolsPageProps) {
  const { getToken } = await auth();

  const token = await getToken();

  if (!token) {
    throw new Error("Unauthorized");
  }

  const params = await searchParams;
  const range = getRange(params.range);

  const { projects } = await getProjects(token);

  const activeProject =
    projects.find(
      (project) => project.id === params.projectId,
    ) ?? projects[0];

  if (!activeProject) {
    return (
      <main className="min-h-full px-6 py-6 lg:px-8">
        <div className="mx-auto max-w-[1600px] space-y-6">
          <AnalyticsHeader
            title="Tools"
            description="Monitor tool execution and performance"
          />

          <section className="rounded-lg border border-dashed bg-muted/10 p-12 text-center">
            <h2 className="text-sm font-medium">
              No project available
            </h2>

            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
              Create a project and start sending traces to view
              tool analytics.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const analytics = await getToolAnalytics(
    token,
    activeProject.id,
    {
      range,
      limit: 20,
    },
  );

  return (
    <main className="min-h-full px-6 py-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-8">
        <AnalyticsHeader
          title="Tools"
          description="Monitor tool execution and performance"
        />

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-medium">
              Overview
            </h2>

            <p className="text-xs text-muted-foreground">
              Tool usage, reliability, and execution performance.
            </p>
          </div>

          <ToolsStats
            totalTools={analytics.summary.totalTools}
            totalCalls={analytics.summary.totalCalls}
            successRate={analytics.summary.successRate}
            avgDuration={analytics.summary.avgDuration}
          />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-medium">
              Execution activity
            </h2>

            <p className="text-xs text-muted-foreground">
              Tool execution volume and performance over time.
            </p>
          </div>

          <AnalyticsTrend
            data={analytics.trend}
            title="Tool Execution Trend"
          />
        </section>

        <section className="space-y-3">
          <div>
            <h2 className="text-sm font-medium">
              Tool performance
            </h2>

            <p className="text-xs text-muted-foreground">
              Detailed execution and latency metrics across tools.
            </p>
          </div>

          <ToolsTable tools={analytics.tools} />
        </section>
      </div>
    </main>
  );
}