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