import { prisma } from "@terrax/database";

import {
  classifySpan,
  extractSemanticSpan,
  type RawSpan,
} from "@terrax/semantic";

export type AnalyticsRange = "24h" | "7d" | "30d" | "all";

/* -------------------------------------------------------------------------- */
/* Shared types                                                               */
/* -------------------------------------------------------------------------- */

export type AnalyticsTrendPoint = {
  timestamp: string;
  runs: number;
  successfulRuns: number;
  failedRuns: number;
  avgDuration: number;
};

/* -------------------------------------------------------------------------- */
/* Agents                                                                     */
/* -------------------------------------------------------------------------- */

export type AgentAnalytics = {
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
};

export type AgentAnalyticsSummary = {
  totalAgents: number;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
  avgDuration: number;
};

export type AgentAnalyticsResponse = {
  summary: AgentAnalyticsSummary;
  trend: AnalyticsTrendPoint[];
  agents: AgentAnalytics[];
};

type AgentAccumulator = {
  runs: number;
  successfulRuns: number;
  failedRuns: number;
  durations: number[];
  firstSeen: Date;
  lastSeen: Date;
};

/* -------------------------------------------------------------------------- */
/* LLMs                                                                       */
/* -------------------------------------------------------------------------- */

export type LlmAnalytics = {
  provider: string;
  model: string;
  calls: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  avgDuration: number;
  successRate: number;
};

export type LlmAnalyticsResponse = {
  llms: LlmAnalytics[];
};

/* -------------------------------------------------------------------------- */
/* Tools                                                                      */
/* -------------------------------------------------------------------------- */

export type ToolAnalytics = {
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
};

export type ToolAnalyticsSummary = {
  totalTools: number;
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  successRate: number;
  avgDuration: number;
};

export type ToolAnalyticsResponse = {
  summary: ToolAnalyticsSummary;
  trend: AnalyticsTrendPoint[];
  tools: ToolAnalytics[];
};

type ToolAccumulator = {
  calls: number;
  successfulCalls: number;
  failedCalls: number;
  durations: number[];
  firstSeen: Date;
  lastSeen: Date;
};

/* -------------------------------------------------------------------------- */
/* Shared database helpers                                                    */
/* -------------------------------------------------------------------------- */

type SpanRecord = {
  traceId: string;
  spanId: string;
  parentSpanId: string | null;
  name: string;
  startTime: Date;
  endTime: Date;
  status: unknown;
  attributes: unknown;
  events: unknown;
  resource: unknown;
};

function normalizeStatus(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    const status = value as Record<string, unknown>;

    if (typeof status.code === "string") {
      return status.code;
    }

    if (typeof status.status_code === "string") {
      return status.status_code;
    }
  }

  return "UNSET";
}

function normalizeJsonRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<string, unknown>;
  }

  return {};
}

function normalizeJsonArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function isError(status: unknown): boolean {
  if (
    !status ||
    typeof status !== "object" ||
    Array.isArray(status)
  ) {
    return false;
  }

  const statusObject =
    status as Record<string, unknown>;

  const code =
    statusObject.code ??
    statusObject.status_code;

  if (typeof code !== "string") {
    return false;
  }

  return code.toUpperCase() === "ERROR";
}

function toRawSpan(span: SpanRecord): RawSpan {
  return {
    traceId: span.traceId,
    spanId: span.spanId,
    parentSpanId: span.parentSpanId,
    name: span.name,
    startTime: span.startTime.toISOString(),
    endTime: span.endTime.toISOString(),
    status: normalizeStatus(span.status),
    attributes: normalizeJsonRecord(span.attributes),
    events: normalizeJsonArray(span.events),
    resource: normalizeJsonRecord(span.resource),
  };
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return (
    values.reduce(
      (sum, value) => sum + value,
      0,
    ) / values.length
  );
}

function percentile(
  values: number[],
  percentileValue: number,
): number {
  if (values.length === 0) {
    return 0;
  }

  const sorted = [...values].sort(
    (a, b) => a - b,
  );

  const index =
    (percentileValue / 100) *
    (sorted.length - 1);

  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sorted[lower];
  }

  const weight = index - lower;

  return (
    sorted[lower] +
    (sorted[upper] - sorted[lower]) * weight
  );
}

function getRangeStart(
  range: AnalyticsRange,
): Date | null {
  const now = Date.now();

  switch (range) {
    case "24h":
      return new Date(
        now - 24 * 60 * 60 * 1000,
      );

    case "7d":
      return new Date(
        now - 7 * 24 * 60 * 60 * 1000,
      );

    case "30d":
      return new Date(
        now - 30 * 24 * 60 * 60 * 1000,
      );

    case "all":
      return null;
  }
}

function getBucketKey(
  date: Date,
  range: AnalyticsRange,
): string {
  if (range === "24h") {
    const bucket = new Date(date);

    bucket.setMinutes(0, 0, 0);

    return bucket.toISOString();
  }

  const bucket = new Date(date);

  bucket.setHours(0, 0, 0, 0);

  return bucket.toISOString();
}

/* -------------------------------------------------------------------------- */
/* Agents analytics                                                           */
/* -------------------------------------------------------------------------- */

export async function getAgentAnalytics(
  projectId: string,
  range: AnalyticsRange = "24h",
  limit = 20,
): Promise<AgentAnalyticsResponse> {
  const rangeStart = getRangeStart(range);

  const where = {
    trace: {
      projectId,
    },
    ...(rangeStart
      ? {
          startTime: {
            gte: rangeStart,
          },
        }
      : {}),
  };

  const spans = await prisma.span.findMany({
    where,
    select: {
      traceId: true,
      spanId: true,
      parentSpanId: true,
      name: true,
      startTime: true,
      endTime: true,
      status: true,
      attributes: true,
      events: true,
      resource: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const agents = new Map<
    string,
    AgentAccumulator
  >();

  const trend = new Map<
    string,
    {
      runs: number;
      successfulRuns: number;
      failedRuns: number;
      durations: number[];
    }
  >();

  for (const span of spans) {
    const rawSpan = toRawSpan(span);

    if (classifySpan(rawSpan) !== "workflow") {
      continue;
    }

    const semanticSpan =
      extractSemanticSpan(rawSpan);

    const duration = Math.max(
      0,
      span.endTime.getTime() -
        span.startTime.getTime(),
    );

    // const failed = isError(span.status);
    const failed =semanticSpan.status?.toUpperCase() === "ERROR";

    const name =
      semanticSpan.name || span.name;

    const existing = agents.get(name);

    if (existing) {
      existing.runs += 1;
      existing.durations.push(duration);

      if (failed) {
        existing.failedRuns += 1;
      } else {
        existing.successfulRuns += 1;
      }

      if (span.startTime < existing.firstSeen) {
        existing.firstSeen = span.startTime;
      }

      if (span.endTime > existing.lastSeen) {
        existing.lastSeen = span.endTime;
      }
    } else {
      agents.set(name, {
        runs: 1,
        successfulRuns: failed ? 0 : 1,
        failedRuns: failed ? 1 : 0,
        durations: [duration],
        firstSeen: span.startTime,
        lastSeen: span.endTime,
      });
    }

    const bucketKey = getBucketKey(
      span.startTime,
      range,
    );

    const trendPoint = trend.get(bucketKey);

    if (trendPoint) {
      trendPoint.runs += 1;
      trendPoint.durations.push(duration);

      if (failed) {
        trendPoint.failedRuns += 1;
      } else {
        trendPoint.successfulRuns += 1;
      }
    } else {
      trend.set(bucketKey, {
        runs: 1,
        successfulRuns: failed ? 0 : 1,
        failedRuns: failed ? 1 : 0,
        durations: [duration],
      });
    }
  }

  const agentResults = Array.from(
    agents.entries(),
  )
    .map(([name, data]) => {
      const {
        runs,
        successfulRuns,
        failedRuns,
        durations,
        firstSeen,
        lastSeen,
      } = data;

      return {
        name,
        runs,
        successfulRuns,
        failedRuns,
        successRate:
          runs > 0
            ? (successfulRuns / runs) * 100
            : 0,
        avgDuration: average(durations),
        minDuration:
          durations.length > 0
            ? Math.min(...durations)
            : 0,
        maxDuration:
          durations.length > 0
            ? Math.max(...durations)
            : 0,
        p50Duration: percentile(
          durations,
          50,
        ),
        p95Duration: percentile(
          durations,
          95,
        ),
        firstSeen: firstSeen.toISOString(),
        lastSeen: lastSeen.toISOString(),
      };
    })
    .sort((a, b) => b.runs - a.runs)
    .slice(0, limit);

  const totalRuns = agentResults.reduce(
    (sum, agent) => sum + agent.runs,
    0,
  );

  const successfulRuns =
    agentResults.reduce(
      (sum, agent) =>
        sum + agent.successfulRuns,
      0,
    );

  const failedRuns =
    agentResults.reduce(
      (sum, agent) =>
        sum + agent.failedRuns,
      0,
    );

  const totalDuration =
    agentResults.reduce(
      (sum, agent) =>
        sum +
        agent.avgDuration * agent.runs,
      0,
    );

  const trendResults =
    Array.from(trend.entries())
      .sort(
        ([a], [b]) =>
          new Date(a).getTime() -
          new Date(b).getTime(),
      )
      .map(([timestamp, data]) => ({
        timestamp,
        runs: data.runs,
        successfulRuns:
          data.successfulRuns,
        failedRuns: data.failedRuns,
        avgDuration: average(
          data.durations,
        ),
      }));

  return {
    summary: {
      totalAgents: agents.size,
      totalRuns,
      successfulRuns,
      failedRuns,
      successRate:
        totalRuns > 0
          ? (successfulRuns / totalRuns) * 100
          : 0,
      avgDuration:
        totalRuns > 0
          ? totalDuration / totalRuns
          : 0,
    },
    trend: trendResults,
    agents: agentResults,
  };
}

/* -------------------------------------------------------------------------- */
/* LLM analytics                                                              */
/* -------------------------------------------------------------------------- */

export async function getLlmAnalytics(
  projectId: string,
): Promise<LlmAnalytics[]> {
  const spans = await prisma.span.findMany({
    where: {
      trace: {
        projectId,
      },
    },
    select: {
      traceId: true,
      spanId: true,
      parentSpanId: true,
      name: true,
      startTime: true,
      endTime: true,
      status: true,
      attributes: true,
      events: true,
      resource: true,
    },
  });

  const llms = new Map<
    string,
    {
      provider: string;
      model: string;
      calls: number;
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      totalDuration: number;
      errors: number;
    }
  >();

  for (const span of spans) {
    const rawSpan = toRawSpan(span);

    if (classifySpan(rawSpan) !== "llm") {
      continue;
    }

    const semanticSpan =
      extractSemanticSpan(rawSpan);

    const provider =
      semanticSpan.provider ?? "unknown";

    const model =
      semanticSpan.model ?? "unknown";

    const key = `${provider}:${model}`;

    const duration = Math.max(
      0,
      span.endTime.getTime() -
        span.startTime.getTime(),
    );

    const existing = llms.get(key);

    if (existing) {
      existing.calls += 1;

      existing.inputTokens +=
        semanticSpan.inputTokens ?? 0;

      existing.outputTokens +=
        semanticSpan.outputTokens ?? 0;

      existing.totalTokens +=
        semanticSpan.totalTokens ?? 0;

      existing.totalDuration += duration;

      if (isError(span.status)) {
        existing.errors += 1;
      }
    } else {
      llms.set(key, {
        provider,
        model,
        calls: 1,
        inputTokens:
          semanticSpan.inputTokens ?? 0,
        outputTokens:
          semanticSpan.outputTokens ?? 0,
        totalTokens:
          semanticSpan.totalTokens ?? 0,
        totalDuration: duration,
        errors: isError(span.status)
          ? 1
          : 0,
      });
    }
  }

  return Array.from(llms.values())
    .map((llm) => ({
      provider: llm.provider,
      model: llm.model,
      calls: llm.calls,
      inputTokens: llm.inputTokens,
      outputTokens: llm.outputTokens,
      totalTokens: llm.totalTokens,
      avgDuration:
        llm.calls > 0
          ? llm.totalDuration / llm.calls
          : 0,
      successRate:
        llm.calls > 0
          ? ((llm.calls - llm.errors) /
              llm.calls) *
            100
          : 0,
    }))
    .sort((a, b) => b.calls - a.calls);
}

/* -------------------------------------------------------------------------- */
/* Tool analytics                                                             */
/* -------------------------------------------------------------------------- */

export async function getToolAnalytics(
  projectId: string,
  range: AnalyticsRange = "24h",
  limit = 20,
): Promise<ToolAnalyticsResponse> {
  const rangeStart = getRangeStart(range);

  const where = {
    trace: {
      projectId,
    },
    ...(rangeStart
      ? {
          startTime: {
            gte: rangeStart,
          },
        }
      : {}),
  };

  const spans = await prisma.span.findMany({
    where,
    select: {
      traceId: true,
      spanId: true,
      parentSpanId: true,
      name: true,
      startTime: true,
      endTime: true,
      status: true,
      attributes: true,
      events: true,
      resource: true,
    },
    orderBy: {
      startTime: "asc",
    },
  });

  const tools = new Map<
    string,
    ToolAccumulator
  >();

  const trend = new Map<
    string,
    {
      calls: number;
      successfulCalls: number;
      failedCalls: number;
      durations: number[];
    }
  >();

  for (const span of spans) {
    const rawSpan = toRawSpan(span);

    if (classifySpan(rawSpan) !== "tool") {
      continue;
    }

    const semanticSpan =
      extractSemanticSpan(rawSpan);

    const duration = Math.max(
      0,
      span.endTime.getTime() -
        span.startTime.getTime(),
    );

    const failed = isError(span.status);

    const name =
      semanticSpan.name || span.name;

    const existing = tools.get(name);

    if (existing) {
      existing.calls += 1;
      existing.durations.push(duration);

      if (failed) {
        existing.failedCalls += 1;
      } else {
        existing.successfulCalls += 1;
      }

      if (span.startTime < existing.firstSeen) {
        existing.firstSeen = span.startTime;
      }

      if (span.endTime > existing.lastSeen) {
        existing.lastSeen = span.endTime;
      }
    } else {
      tools.set(name, {
        calls: 1,
        successfulCalls: failed ? 0 : 1,
        failedCalls: failed ? 1 : 0,
        durations: [duration],
        firstSeen: span.startTime,
        lastSeen: span.endTime,
      });
    }

    const bucketKey = getBucketKey(
      span.startTime,
      range,
    );

    const trendPoint = trend.get(bucketKey);

    if (trendPoint) {
      trendPoint.calls += 1;
      trendPoint.durations.push(duration);

      if (failed) {
        trendPoint.failedCalls += 1;
      } else {
        trendPoint.successfulCalls += 1;
      }
    } else {
      trend.set(bucketKey, {
        calls: 1,
        successfulCalls: failed ? 0 : 1,
        failedCalls: failed ? 1 : 0,
        durations: [duration],
      });
    }
  }

  const allToolResults = Array.from(
    tools.entries(),
  )
    .map(([name, data]) => {
      const {
        calls,
        successfulCalls,
        failedCalls,
        durations,
        firstSeen,
        lastSeen,
      } = data;

      return {
        name,
        calls,
        successfulCalls,
        failedCalls,
        successRate:
          calls > 0
            ? (successfulCalls / calls) * 100
            : 0,
        avgDuration: average(durations),
        minDuration:
          durations.length > 0
            ? Math.min(...durations)
            : 0,
        maxDuration:
          durations.length > 0
            ? Math.max(...durations)
            : 0,
        p50Duration: percentile(
          durations,
          50,
        ),
        p95Duration: percentile(
          durations,
          95,
        ),
        firstSeen: firstSeen.toISOString(),
        lastSeen: lastSeen.toISOString(),
      };
    })
    .sort((a, b) => b.calls - a.calls);

  const toolResults =
    allToolResults.slice(0, limit);

  const totalCalls =
    allToolResults.reduce(
      (sum, tool) => sum + tool.calls,
      0,
    );

  const successfulCalls =
    allToolResults.reduce(
      (sum, tool) =>
        sum + tool.successfulCalls,
      0,
    );

  const failedCalls =
    allToolResults.reduce(
      (sum, tool) =>
        sum + tool.failedCalls,
      0,
    );

  const totalDuration =
    allToolResults.reduce(
      (sum, tool) =>
        sum +
        tool.avgDuration * tool.calls,
      0,
    );

  const trendResults =
    Array.from(trend.entries())
      .sort(
        ([a], [b]) =>
          new Date(a).getTime() -
          new Date(b).getTime(),
      )
      .map(([timestamp, data]) => ({
        timestamp,
        runs: data.calls,
        successfulRuns:
          data.successfulCalls,
        failedRuns: data.failedCalls,
        avgDuration: average(
          data.durations,
        ),
      }));

  return {
    summary: {
      totalTools: tools.size,
      totalCalls,
      successfulCalls,
      failedCalls,
      successRate:
        totalCalls > 0
          ? (successfulCalls / totalCalls) * 100
          : 0,
      avgDuration:
        totalCalls > 0
          ? totalDuration / totalCalls
          : 0,
    },
    trend: trendResults,
    tools: toolResults,
  };
}
