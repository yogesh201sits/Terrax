import { getTrace } from "@/lib/api/traces";
import { TraceTree } from "@/components/traces/trace-tree";
import { TraceSummary } from "@/components/traces/trace-summary";
import { TraceTimelineToggle } from "@/components/traces/trace-timeline-toggle";

type Props = {
  params: Promise<{
    traceId: string;
  }>;
};

export default async function TraceDetailPage({ params }: Props) {
  const { traceId } = await params;

  const decodedTraceId = decodeURIComponent(traceId);

  const trace = await getTrace(decodedTraceId);

  const root = trace.tree.roots[0];

  return (
    <div className="p-6">
      <div className="mb-6">
        <p className="mb-1 text-sm text-muted-foreground">
          Trace Detail
        </p>

        <h1 className="text-2xl font-semibold tracking-tight">
          {root?.span.name ?? "Trace"}
        </h1>

        <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
          {decodedTraceId}
        </p>
      </div>

      <TraceSummary roots={trace.tree.roots} />

      <TraceTree roots={trace.tree.roots} />

      <TraceTimelineToggle roots={trace.tree.roots} />
    </div>
  );
}