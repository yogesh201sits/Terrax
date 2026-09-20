import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getTrace } from "@/lib/api/traces";
import { Playground } from "@/components/playground/playground";
import type { TraceTreeNode } from "@/types/trace-detail";

type Props = {
  params: Promise<{
    traceId: string;
    spanId: string;
  }>;
  searchParams: Promise<{
    projectId?: string;
  }>;
};

function findSpan(
  nodes: TraceTreeNode[],
  spanId: string,
): TraceTreeNode | null {
  for (const node of nodes) {
    if (node.span.spanId === spanId) {
      return node;
    }

    const child = findSpan(node.children, spanId);

    if (child) {
      return child;
    }
  }

  return null;
}

export default async function PlaygroundPage({
  params,
  searchParams,
}: Props) {
  const { traceId, spanId } = await params;
  const { projectId } = await searchParams;

  const decodedTraceId = decodeURIComponent(traceId);
  const decodedSpanId = decodeURIComponent(spanId);

  if (!projectId || !traceId || !spanId) {
    return (
      <PlaygroundError
        message="A project, trace, and span are required to open the Playground."
      />
    );
  }

  const { getToken } = await auth();
  const token = await getToken();

  if (!token) {
    redirect("/sign-in");
  }

  let trace;

  try {
    trace = await getTrace(
      projectId,
      decodedTraceId,
      token,
    );
  } catch {
    return (
      <PlaygroundError
        message="Unable to load the source trace."
      />
    );
  }

  const span = findSpan(
    trace.tree.roots,
    decodedSpanId,
  );

  if (!span) {
    return (
      <PlaygroundError
        message="The selected span could not be found in this trace."
      />
    );
  }

  if (span.span.type !== "llm") {
    return (
      <PlaygroundError
        message="The Playground can only be opened for LLM spans."
      />
    );
  }

  return (
    <Playground
      projectId={projectId}
      traceId={decodedTraceId}
      span={span.span}
    />
  );
}

function PlaygroundError({
  message,
}: {
  message: string;
}) {
  return (
    <div className="p-6">
      <div className="mx-auto max-w-3xl rounded-lg border bg-background">
        <div className="border-b px-5 py-4">
          <h1 className="font-semibold">
            Playground
          </h1>
        </div>

        <div className="p-8">
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}