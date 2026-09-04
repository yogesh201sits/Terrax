import { getTraces } from "@/lib/api/traces";
import { TraceActivityChart } from "@/components/dashboard/trace-activity-chart";

export default async function OverviewPage() {
  const { traces } = await getTraces();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Overview
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Monitor your AI agent executions.
        </p>
      </div>

      <div className="space-y-6">
        <TraceActivityChart traces={traces} />
      </div>
    </div>
  );
}
