import type { SemanticSpan } from "./types.js";

export interface TraceSummary {
  status: "OK" | "ERROR" | "UNSET";
  durationMs: number;
  llmCalls: number;
  toolCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  errors: number;
}

export function calculateTraceSummary(
  spans: SemanticSpan[],
): TraceSummary {
  if (spans.length === 0) {
    return {
      status: "UNSET",
      durationMs: 0,
      llmCalls: 0,
      toolCalls: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      totalTokens: 0,
      errors: 0,
    };
  }

  let earliestStart = new Date(
    spans[0].startTime,
  ).getTime();

  let latestEnd = new Date(
    spans[0].endTime,
  ).getTime();

  let llmCalls = 0;
  let toolCalls = 0;

  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;

  let errors = 0;

  let hasError = false;

  for (const span of spans) {
    const start = new Date(
      span.startTime,
    ).getTime();

    const end = new Date(
      span.endTime,
    ).getTime();

    if (start < earliestStart) {
      earliestStart = start;
    }

    if (end > latestEnd) {
      latestEnd = end;
    }

    if (span.type === "llm") {
      llmCalls++;
    }

    if (span.type === "tool") {
      toolCalls++;
    }

    if (span.inputTokens !== undefined) {
      totalInputTokens += span.inputTokens;
    }

    if (span.outputTokens !== undefined) {
      totalOutputTokens += span.outputTokens;
    }

    if (span.totalTokens !== undefined) {
      totalTokens += span.totalTokens;
    }

    if (span.status === "ERROR") {
      errors++;
      hasError = true;
    }
  }

  return {
    status: hasError ? "ERROR" : "OK",
    durationMs: latestEnd - earliestStart,
    llmCalls,
    toolCalls,
    totalInputTokens,
    totalOutputTokens,
    totalTokens,
    errors,
  };
}