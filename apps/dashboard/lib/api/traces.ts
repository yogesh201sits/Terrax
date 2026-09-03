import type { TraceDetail } from "@/types/trace-detail";
import type { TracesResponse } from "@/types/traces";

const API_URL =
  process.env.NEXT_PUBLIC_TERRAX_API_URL ??
  "http://localhost:3000";

const API_KEY = "terrax_test_key";

export async function getTraces(): Promise<TracesResponse> {
  const response = await fetch(`${API_URL}/v1/traces`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Failed to fetch traces: ${response.status} ${body}`,
    );
  }

  return response.json();
}

export async function getTrace(
  traceId: string,
): Promise<TraceDetail> {
  // Normalize dynamic route encoding before building the API path.
  const normalizedTraceId = decodeURIComponent(traceId).replace(
    / /g,
    "+",
  );
  const response = await fetch(
    `${API_URL}/v1/traces/${encodeURIComponent(normalizedTraceId)}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
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