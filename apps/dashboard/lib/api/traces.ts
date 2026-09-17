import type { TraceDetail } from "@/types/trace-detail";
import type { TracesResponse } from "@/types/traces";

const API_URL =
  process.env.NEXT_PUBLIC_TERRAX_API_URL ??
  "http://localhost:3000";

export async function getTraces(
  projectId: string,
  token: string,
): Promise<TracesResponse> {
  const response = await fetch(
    `${API_URL}/v1/projects/${projectId}/traces`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Failed to fetch traces: ${response.status} ${body}`,
    );
  }

  return response.json();
}

export async function getTrace(
  projectId: string,
  traceId: string,
  token: string,
): Promise<TraceDetail> {
  const normalizedTraceId = decodeURIComponent(traceId).replace(
    / /g,
    "+",
  );

  const response = await fetch(
    `${API_URL}/v1/projects/${projectId}/traces/${encodeURIComponent(
      normalizedTraceId,
    )}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Failed to fetch trace: ${response.status} ${body}`,
    );
  }

  return response.json();
}