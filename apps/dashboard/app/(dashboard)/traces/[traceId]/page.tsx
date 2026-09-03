import { getTrace } from "@/lib/api/traces";

type Props = {
  params: Promise<{
    traceId: string;
  }>;
};

export default async function TraceDetailPage({ params }: Props) {
  const { traceId } = await params;
  console.log("Dashboard traceId:", traceId);
  console.log("Dashboard traceId JSON:", JSON.stringify(traceId));

  const trace = await getTrace(traceId);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold">
        Trace Detail
      </h1>

      <p className="mt-2 text-sm text-muted-foreground">
        {traceId}
      </p>

      <pre className="mt-6 overflow-auto rounded-lg border p-4 text-sm">
        {JSON.stringify(trace, null, 2)}
      </pre>
    </div>
  );
}