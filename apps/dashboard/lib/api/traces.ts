const API_URL =
  process.env.NEXT_PUBLIC_TERRAX_API_URL ?? "http://localhost:3000";

export async function getTraces() {
  const response = await fetch(`${API_URL}/v1/traces`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch traces");
  }

  return response.json();
}

export async function getTrace(traceId: string) {
  const response = await fetch(
    `${API_URL}/v1/traces/${traceId}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch trace");
  }

  return response.json();
}