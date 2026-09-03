import { prisma } from "@terrax/database";

import {
  extractSemanticSpan,
  buildTraceTree,
  type RawSpan,
  type SemanticSpan,
} from "@terrax/semantic";

import type { TraceResponse } from "../types/trace-response.js";
import { toTraceTreeNodeResponse } from "./trace-response.js";

export async function getTrace(
  projectId: string,
  traceId: string,
): Promise<TraceResponse | null> {
  const trace = await prisma.trace.findUnique({
    where: {
      projectId_traceId: {
        projectId,
        traceId,
      },
    },

    select: {
      traceId: true,
      createdAt: true,

      spans: {
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
      },
    },
  });

  if (!trace) {
    return null;
  }

  const rawSpans: RawSpan[] = trace.spans.map((span) => {
    let status: string | undefined;

    if (typeof span.status === "string") {
      status = span.status;
    }

    return {
      traceId: span.traceId,
      spanId: span.spanId,
      parentSpanId: span.parentSpanId,
      name: span.name,

      startTime: span.startTime.toISOString(),
      endTime: span.endTime.toISOString(),

      status,

      attributes:
        span.attributes as Record<string, unknown>,

      events: span.events as unknown[],

      resource:
        span.resource as Record<string, unknown>,
    };
  });

  const semanticSpans: SemanticSpan[] =
    rawSpans.map((span) => {
      return extractSemanticSpan(span);
    });

  const tree = buildTraceTree(semanticSpans);

  return {
    traceId: trace.traceId,
    createdAt: trace.createdAt,

    tree: {
      traceId: trace.traceId,

      roots: tree.roots.map((root) => {
        return toTraceTreeNodeResponse(root);
      }),
    },
  };
}

export async function listTraces(projectId: string) {
  const traces = await prisma.trace.findMany({
    where: {
      projectId,
    },

    select: {
      traceId: true,
      createdAt: true,

      spans: {
        select: {
          name: true,
          startTime: true,
          endTime: true,
          status: true,
          attributes: true,
        },

        orderBy: {
          startTime: "asc",
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },

    take: 50,
  });

  return traces.map((trace) => {
    let startTime: Date | null = null;
    let endTime: Date | null = null;

    let spanCount = 0;
    let llmCalls = 0;
    let toolCalls = 0;
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalTokens = 0;
    let hasError = false;

    for (const span of trace.spans) {
      spanCount++;

      if (!startTime || span.startTime < startTime) {
        startTime = span.startTime;
      }

      if (!endTime || span.endTime > endTime) {
        endTime = span.endTime;
      }

      if (span.status === "ERROR") {
        hasError = true;
      }

      const attributes =
        span.attributes as Record<string, unknown>;

      const operationName =
        attributes["gen_ai.operation.name"];

      const spanKind =
        attributes["langsmith.span.kind"];

      if (
        operationName === "chat" ||
        operationName === "completion"
      ) {
        llmCalls++;
      }

      if (
        spanKind === "tool" ||
        operationName === "execute_tool"
      ) {
        toolCalls++;
      }

      const inputTokens =
        attributes["gen_ai.usage.input_tokens"];

      const outputTokens =
        attributes["gen_ai.usage.output_tokens"];

      const tokens =
        attributes["gen_ai.usage.total_tokens"];

      if (typeof inputTokens === "number") {
        totalInputTokens += inputTokens;
      }

      if (typeof outputTokens === "number") {
        totalOutputTokens += outputTokens;
      }

      if (typeof tokens === "number") {
        totalTokens += tokens;
      }
    }

    const durationMs =
      startTime && endTime
        ? endTime.getTime() - startTime.getTime()
        : 0;

    return {
      traceId: trace.traceId,
      name: trace.spans[0]?.name ?? "Trace",
      startTime,
      endTime,
      durationMs,
      spanCount,
      llmCalls,
      toolCalls,
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      status: hasError ? "ERROR" : "OK",
      createdAt: trace.createdAt,
    };
  });
}
