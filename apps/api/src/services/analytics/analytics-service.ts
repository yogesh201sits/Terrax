import { prisma } from "@terrax/database";
import {
  classifySpan,
  type RawSpan,
  extractSemanticSpan,
} from "@terrax/semantic";

export type AgentAnalytics = {
  name: string;
  runs: number;
  successfulRuns: number;
  failedRuns: number;
  successRate: number;
  avgDuration: number;
};

export async function getAgentAnalytics(
  projectId: string,
): Promise<AgentAnalytics[]> {
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

  const agents = new Map<
    string,
    {
      runs: number;
      successfulRuns: number;
      failedRuns: number;
      totalDuration: number;
    }
  >();

  for (const span of spans) {
    const rawSpan: RawSpan = {
      traceId: span.traceId,
      spanId: span.spanId,
      parentSpanId: span.parentSpanId,

      name: span.name,

      startTime: span.startTime.toISOString(),
      endTime: span.endTime.toISOString(),

      status: normalizeStatus(span.status),
      attributes: normalizeJsonRecord(
        span.attributes,
      ),
      events: normalizeJsonArray(span.events),
      resource: normalizeJsonRecord(
        span.resource,
      ),
    };

    const type = classifySpan(rawSpan);

    if (type !== "workflow") {
      continue;
    }

    const duration =
      span.endTime.getTime() -
      span.startTime.getTime();

    const existing = agents.get(span.name);

    if (existing) {
      existing.runs++;
      existing.totalDuration += duration;

      if (isError(span.status)) {
        existing.failedRuns++;
      } else {
        existing.successfulRuns++;
      }

      continue;
    }

    agents.set(span.name, {
      runs: 1,
      successfulRuns: isError(span.status)
        ? 0
        : 1,
      failedRuns: isError(span.status)
        ? 1
        : 0,
      totalDuration: duration,
    });
  }

  return Array.from(agents.entries())
    .map(([name, data]) => ({
      name,
      runs: data.runs,
      successfulRuns: data.successfulRuns,
      failedRuns: data.failedRuns,
      successRate:
        data.runs === 0
          ? 0
          : Number(
              (
                (data.successfulRuns /
                  data.runs) *
                100
              ).toFixed(2),
            ),
      avgDuration:
        data.runs === 0
          ? 0
          : Math.round(
              data.totalDuration /
                data.runs,
            ),
    }))
    .sort((a, b) => b.runs - a.runs);
}

function normalizeJsonRecord(
  value: unknown,
): Record<string, unknown> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value)
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  return {};
}

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
      successfulCalls: number;
      failedCalls: number;
    }
  >();

  for (const span of spans) {
    const rawSpan: RawSpan = {
      traceId: span.traceId,
      spanId: span.spanId,
      parentSpanId: span.parentSpanId,
      name: span.name,
      startTime: span.startTime.toISOString(),
      endTime: span.endTime.toISOString(),
      status: normalizeStatus(span.status),
      attributes: normalizeJsonRecord(
        span.attributes,
      ),
      events: normalizeJsonArray(span.events),
      resource: normalizeJsonRecord(
        span.resource,
      ),
    };

    const semanticSpan = extractSemanticSpan(rawSpan);

    if (semanticSpan.type !== "llm") {
      continue;
    }

    const provider =
      semanticSpan.provider ?? "unknown";

    const model =
      semanticSpan.model ?? "unknown";

    const key = `${provider}:${model}`;

    const duration =
      span.endTime.getTime() -
      span.startTime.getTime();

    const inputTokens =
      semanticSpan.inputTokens ?? 0;

    const outputTokens =
      semanticSpan.outputTokens ?? 0;

    const totalTokens =
      semanticSpan.totalTokens ??
      inputTokens + outputTokens;

    const failed =
      semanticSpan.status === "ERROR";

    const existing = llms.get(key);

    if (existing) {
      existing.calls++;
      existing.inputTokens += inputTokens;
      existing.outputTokens += outputTokens;
      existing.totalTokens += totalTokens;
      existing.totalDuration += duration;

      if (failed) {
        existing.failedCalls++;
      } else {
        existing.successfulCalls++;
      }

      continue;
    }

    llms.set(key, {
      provider,
      model,
      calls: 1,
      inputTokens,
      outputTokens,
      totalTokens,
      totalDuration: duration,
      successfulCalls: failed ? 0 : 1,
      failedCalls: failed ? 1 : 0,
    });
  }

  return Array.from(llms.values())
    .map((data) => ({
      provider: data.provider,
      model: data.model,

      calls: data.calls,

      inputTokens: data.inputTokens,
      outputTokens: data.outputTokens,
      totalTokens: data.totalTokens,

      avgDuration:
        data.calls === 0
          ? 0
          : Math.round(
              data.totalDuration /
                data.calls,
            ),

      successRate:
        data.calls === 0
          ? 0
          : Number(
              (
                (data.successfulCalls /
                  data.calls) *
                100
              ).toFixed(2),
            ),
    }))
    .sort((a, b) => b.calls - a.calls);
}

function normalizeJsonArray(
  value: unknown,
): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }

  return [];
}

function isError(
  status: unknown,
): boolean {
  if (
    !status ||
    typeof status !== "object" ||
    Array.isArray(status)
  ) {
    return false;
  }

  const statusObject =
    status as Record<string, unknown>;

  return (
    statusObject.code === "ERROR" ||
    statusObject.status_code === "ERROR"
  );
}
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