import type { SemanticSpanNode } from "@terrax/semantic";

import type {
  TraceSpanResponse,
  TraceTreeNodeResponse,
} from "../types/trace-response.js";

function toTraceSpanResponse(
  span: SemanticSpanNode["span"],
): TraceSpanResponse {
  const startTime = new Date(span.startTime);
  const endTime = new Date(span.endTime);

  const durationMs =
    endTime.getTime() - startTime.getTime();

  const response: TraceSpanResponse = {
    traceId: span.traceId,
    spanId: span.spanId,
    parentSpanId: span.parentSpanId ?? null,

    type: span.type,
    name: span.name,

    startTime: span.startTime,
    endTime: span.endTime,

    durationMs,
  };

  if (span.framework) {
    response.framework = span.framework;
  }

  if (span.provider) {
    response.provider = span.provider;
  }

  if (span.model) {
    response.model = span.model;
  }

  if (span.inputTokens !== undefined) {
    response.inputTokens = span.inputTokens;
  }

  if (span.outputTokens !== undefined) {
    response.outputTokens = span.outputTokens;
  }

  if (span.totalTokens !== undefined) {
    response.totalTokens = span.totalTokens;
  }

  if (span.reasoningTokens !== undefined) {
    response.reasoningTokens = span.reasoningTokens;
  }

  if (span.prompt !== undefined) {
    response.prompt = span.prompt;
  }

  if (span.completion !== undefined) {
    response.completion = span.completion;
  }

  if (span.toolCalls !== undefined) {
    response.toolCalls = span.toolCalls;
  }

  if (span.toolInput !== undefined) {
    response.toolInput = span.toolInput;
  }

  if (span.toolOutput !== undefined) {
    response.toolOutput = span.toolOutput;
  }

  if (span.status !== undefined) {
    response.status = span.status;
  }

  if (span.errorType !== undefined) {
    response.errorType = span.errorType;
  }

  if (span.errorMessage !== undefined) {
    response.errorMessage = span.errorMessage;
  }

  return response;
}

export function toTraceTreeNodeResponse(
  node: SemanticSpanNode,
): TraceTreeNodeResponse {
  return {
    span: toTraceSpanResponse(node.span),

    children: node.children.map((child) => {
      return toTraceTreeNodeResponse(child);
    }),
  };
}

