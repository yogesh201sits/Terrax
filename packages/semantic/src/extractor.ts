import { classifySpan } from "./classifier.js";

import type {
  RawSpan,
  SemanticSpan
} from "./types.js";

export function extractSemanticSpan(
  span: RawSpan
): SemanticSpan {
  const attributes = span.attributes;

  const semanticSpan: SemanticSpan = {
    traceId: span.traceId,
    spanId: span.spanId,
    parentSpanId: span.parentSpanId,

    type: classifySpan(span),

    name: span.name,

    startTime: span.startTime,
    endTime: span.endTime,

    attributes
  };

  /*
   * Framework
   */
  const integration = getString(
    attributes,
    "langsmith.metadata.ls_integration"
  );

  if (integration) {
    if (integration.startsWith("langchain")) {
      semanticSpan.framework = "langchain";
    } else {
      semanticSpan.framework = integration;
    }
  }

  /*
   * Provider
   */
  const provider = getString(
    attributes,
    "langsmith.metadata.ls_provider"
  );

  if (provider) {
    semanticSpan.provider = provider;
  }

  /*
   * Model
   */
  const model = getString(
    attributes,
    "gen_ai.request.model"
  );

  if (model) {
    semanticSpan.model = model;
  }

  /*
   * Token usage
   */
  semanticSpan.inputTokens = getNumber(
    attributes,
    "gen_ai.usage.input_tokens"
  );

  semanticSpan.outputTokens = getNumber(
    attributes,
    "gen_ai.usage.output_tokens"
  );

  semanticSpan.totalTokens = getNumber(
    attributes,
    "gen_ai.usage.total_tokens"
  );

  if (span.status) {
    semanticSpan.status = span.status;
  }

  /*
   * Prompt
   */
  const prompt = getJson(
    attributes,
    "gen_ai.prompt"
  );

  if (prompt !== undefined) {
    semanticSpan.prompt = prompt;
  }

  /*
   * Completion
   */
  const completion = getJson(
    attributes,
    "gen_ai.completion"
  );

  if (completion !== undefined) {
    semanticSpan.completion = completion;
  }

  /*
   * Tool calls
   */
  const toolCalls = extractToolCalls(prompt);

  if (toolCalls.length > 0) {
    semanticSpan.toolCalls = toolCalls;
  }

  const error = extractError(
    attributes,
    span.events,
  );

  if (error) {
    semanticSpan.errorType = error.type;
    semanticSpan.errorMessage = error.message;
  }

  /*
 * Tool input
 */
const toolInput = extractToolInput(prompt);

if (toolInput !== undefined) {
  semanticSpan.toolInput = toolInput;
}

/*
 * Tool output
 */
const toolOutput = extractToolOutput(completion);

if (toolOutput !== undefined) {
  semanticSpan.toolOutput = toolOutput;
}

  /*
   * Reasoning tokens
   */
  const reasoningTokens =
    extractReasoningTokens(prompt);

  if (reasoningTokens !== undefined) {
    semanticSpan.reasoningTokens =
      reasoningTokens;
  }

  return semanticSpan;
}

function getString(
  attributes: Record<string, unknown>,
  key: string
): string | undefined {
  const value = attributes[key];

  if (typeof value !== "string") {
    return undefined;
  }

  return value;
}

function getNumber(
  attributes: Record<string, unknown>,
  key: string
): number | undefined {
  const value = attributes[key];

  if (typeof value === "number") {
    return value;
  }

  return undefined;
}

function getJson(
  attributes: Record<string, unknown>,
  key: string
): unknown | undefined {
  const value = attributes[key];

  if (typeof value !== "string") {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

function extractToolCalls(
  prompt: unknown
): unknown[] {
  if (!prompt || typeof prompt !== "object") {
    return [];
  }

  const messages = (
    prompt as {
      messages?: unknown;
    }
  ).messages;

  if (!Array.isArray(messages)) {
    return [];
  }

  const toolCalls: unknown[] = [];

  for (const message of messages) {
    if (
      !message ||
      typeof message !== "object"
    ) {
      continue;
    }

    const calls = (
      message as {
        tool_calls?: unknown;
      }
    ).tool_calls;

    if (!Array.isArray(calls)) {
      continue;
    }

    for (const call of calls) {
      toolCalls.push(call);
    }
  }

  return toolCalls;
}

function extractReasoningTokens(
  prompt: unknown
): number | undefined {
  if (!prompt || typeof prompt !== "object") {
    return undefined;
  }

  const messages = (
    prompt as {
      messages?: unknown;
    }
  ).messages;

  if (!Array.isArray(messages)) {
    return undefined;
  }

  for (const message of messages) {
    if (
      !message ||
      typeof message !== "object"
    ) {
      continue;
    }

    const usageMetadata = (
      message as {
        usage_metadata?: unknown;
      }
    ).usage_metadata;

    if (
      !usageMetadata ||
      typeof usageMetadata !== "object"
    ) {
      continue;
    }

    const outputTokenDetails = (
      usageMetadata as {
        output_token_details?: unknown;
      }
    ).output_token_details;

    if (
      !outputTokenDetails ||
      typeof outputTokenDetails !== "object"
    ) {
      continue;
    }

    const reasoning = (
      outputTokenDetails as {
        reasoning?: unknown;
      }
    ).reasoning;

    if (typeof reasoning === "number") {
      return reasoning;
    }
  }

  return undefined;
}

function extractToolInput(
  prompt: unknown
): unknown | undefined {
  if (!prompt || typeof prompt !== "object") {
    return undefined;
  }

  const input = (
    prompt as {
      input?: unknown;
    }
  ).input;

  if (!Array.isArray(input)) {
    return undefined;
  }

  if (input.length === 0) {
    return undefined;
  }

  return input;
}

function extractToolOutput(
  completion: unknown
): unknown | undefined {
  if (!completion || typeof completion !== "object") {
    return undefined;
  }

  const messages = (
    completion as {
      messages?: unknown;
    }
  ).messages;

  if (!Array.isArray(messages)) {
    return undefined;
  }

  if (messages.length === 0) {
    return undefined;
  }

  return messages;
}

function extractError(
  attributes: Record<string, unknown>,
  events?: unknown[],
): {
  type?: string;
  message?: string;
} | undefined {
  const errorType = getString(
    attributes,
    "error.type",
  );

  const errorMessage = getString(
    attributes,
    "error.message",
  );

  if (errorType || errorMessage) {
    return {
      type: errorType,
      message: errorMessage,
    };
  }

  if (!events) {
    return undefined;
  }

  for (const event of events) {
    if (
      !event ||
      typeof event !== "object"
    ) {
      continue;
    }

    const eventObject = event as {
      name?: unknown;
      attributes?: unknown;
    };

    if (eventObject.name !== "exception") {
      continue;
    }

    if (
      !eventObject.attributes ||
      !Array.isArray(eventObject.attributes)
    ) {
      continue;
    }

    let exceptionType: string | undefined;
    let exceptionMessage: string | undefined;

    for (const attribute of eventObject.attributes) {
      if (
        !attribute ||
        typeof attribute !== "object"
      ) {
        continue;
      }

      const item = attribute as {
        key?: unknown;
        value?: unknown;
      };

      if (
        typeof item.key !== "string" ||
        !item.value ||
        typeof item.value !== "object"
      ) {
        continue;
      }

      const value = item.value as {
        stringValue?: unknown;
      };

      if (
        typeof value.stringValue !== "string"
      ) {
        continue;
      }

      if (
        item.key === "exception.type"
      ) {
        exceptionType = value.stringValue;
      }

      if (
        item.key === "exception.message"
      ) {
        exceptionMessage = value.stringValue;
      }
    }

    if (exceptionType || exceptionMessage) {
      return {
        type: exceptionType,
        message: exceptionMessage,
      };
    }
  }

  return undefined;
}