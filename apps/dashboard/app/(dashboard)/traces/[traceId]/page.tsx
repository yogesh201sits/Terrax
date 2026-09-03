import { getTrace } from "@/lib/api/traces";
import { TraceTree } from "@/components/traces/trace-tree";

type Props = {
  params: Promise<{
    traceId: string;
  }>;
};

export default async function TraceDetailPage({ params }: Props) {
  const { traceId } = await params;

  const decodedTraceId = decodeURIComponent(traceId);

  const trace = await getTrace(decodedTraceId);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">
          {trace.tree.roots[0]?.span.name ?? "Trace"}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {decodedTraceId}
        </p>
      </div>

      <TraceTree roots={trace.tree.roots} />
    </div>
  );
}