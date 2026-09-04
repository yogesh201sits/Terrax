import { getTraces } from "@/lib/api/traces";
import { TraceTable } from "@/components/traces/trace-table";

export default async function TracesPage() {
  const { traces } = await getTraces();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Traces
        </h1>

        <p className="text-sm text-muted-foreground">
          Explore AI agent executions and OpenTelemetry traces.
        </p>
      </div>

      {traces.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No traces found.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <TraceTable traces={traces} />
        </div>
      )}
    </div>
  );
}
