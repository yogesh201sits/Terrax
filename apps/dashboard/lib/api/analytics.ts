

const API_URL =
  process.env.NEXT_PUBLIC_TERRAX_API_URL ?? "http://localhost:3000";

export type AnalyticsRange = "24h" | "7d" | "30d" | "all";

export interface AnalyticsQuery {
  range?: AnalyticsRange;
  limit?: number;
}

/* -------------------------------------------------------------------------- */
/* Shared                                                                      */
/* -------------------------------------------------------------------------- */

export interface AnalyticsTrendPoint {
  timestamp: string;
  runs?: number;
  successfulRuns?: number;
  failedRuns?: number;
  calls?: number;
  successfulCalls?: number;
  failedCalls?: number;
  avgDuration: number;
}

/* -------------------------------------------------------------------------- */
/* Overview                                                                    */
/* -------------------------------------------------------------------------- */

export interface OverviewAnalytics {
  [key: string]: unknown;
}

/* -------------------------------------------------------------------------- */
/* Agents                                                                      */
/* -------------------------------------------------------------------------- */

export interface AgentAnalyticsSummary {
  totalAgents: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
  avgDuration: number;
}

export interface AgentAnalytics {
  name: string;
  runs: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;

  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p50Duration: number;
  p95Duration: number;

  firstSeen: string;
  lastSeen: string;
}

export interface AgentAnalyticsResponse {
  summary: AgentAnalyticsSummary;
  trend: AnalyticsTrendPoint[];
  agents: AgentAnalytics[];
}

/* -------------------------------------------------------------------------- */
/* LLMs                                                                        */
/* -------------------------------------------------------------------------- */

export interface LlmAnalyticsSummary {
  totalProviders: number;
  totalModels: number;
  totalCalls: number;

  inputTokens: number;
  outputTokens: number;
  totalTokens: number;

  avgDuration: number;
  successRate: number;
}

export interface LlmAnalytics {
  provider: string;
  model: string;

  calls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;

  inputTokens: number;
  outputTokens: number;
  totalTokens: number;

  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p50Duration: number;
  p95Duration: number;

  firstSeen: string;
  lastSeen: string;
}

export interface LlmAnalyticsResponse {
  summary: LlmAnalyticsSummary;
  trend: AnalyticsTrendPoint[];
  llms: LlmAnalytics[];
}

/* -------------------------------------------------------------------------- */
/* Tools                                                                       */
/* -------------------------------------------------------------------------- */

export interface ToolAnalyticsSummary {
  totalTools: number;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  avgDuration: number;
}

export interface ToolAnalytics {
  name: string;

  calls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;

  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p50Duration: number;
  p95Duration: number;

  firstSeen: string;
  lastSeen: string;
}

export interface ToolAnalyticsResponse {
  summary: ToolAnalyticsSummary;
  trend: AnalyticsTrendPoint[];
  tools: ToolAnalytics[];
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

function buildQuery(params: AnalyticsQuery = {}) {
  const searchParams = new URLSearchParams();

  if (params.range) {
    searchParams.set("range", params.range);
  }

  if (params.limit !== undefined) {
    searchParams.set("limit", String(params.limit));
  }

  const query = searchParams.toString();

  return query ? `?${query}` : "";
}

async function apiRequest<T>(
  path: string,
  token: string,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const body = await response.json();

      if (
        body &&
        typeof body === "object" &&
        "error" in body &&
        typeof body.error === "string"
      ) {
        message = body.error;
      }
    } catch {
      // Keep default error message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

/* -------------------------------------------------------------------------- */
/* Overview                                                                    */
/* -------------------------------------------------------------------------- */

export async function getOverviewAnalytics(
  token: string,
  projectId: string,
  params: AnalyticsQuery = {},
): Promise<OverviewAnalytics> {
  return apiRequest<OverviewAnalytics>(
    `/v1/projects/${projectId}/analytics/overview${buildQuery(params)}`,
    token,
  );
}

/* -------------------------------------------------------------------------- */
/* Agents                                                                      */
/* -------------------------------------------------------------------------- */

export async function getAgentAnalytics(
  token: string,
  projectId: string,
  params: AnalyticsQuery = {},
): Promise<AgentAnalyticsResponse> {
  return apiRequest<AgentAnalyticsResponse>(
    `/v1/projects/${projectId}/analytics/agents${buildQuery(params)}`,
    token,
  );
}

/* -------------------------------------------------------------------------- */
/* LLMs                                                                        */
/* -------------------------------------------------------------------------- */

export async function getLlmAnalytics(
  token: string,
  projectId: string,
  params: AnalyticsQuery = {},
): Promise<LlmAnalyticsResponse> {
  return apiRequest<LlmAnalyticsResponse>(
    `/v1/projects/${projectId}/analytics/llms${buildQuery(params)}`,
    token,
  );
}

/* -------------------------------------------------------------------------- */
/* Tools                                                                       */
/* -------------------------------------------------------------------------- */

export async function getToolAnalytics(
  token: string,
  projectId: string,
  params: AnalyticsQuery = {},
): Promise<ToolAnalyticsResponse> {
  return apiRequest<ToolAnalyticsResponse>(
    `/v1/projects/${projectId}/analytics/tools${buildQuery(params)}`,
    token,
  );
}