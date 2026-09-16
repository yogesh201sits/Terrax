import { classifySpan } from "./classifier.js";

import type {
  RawSpan,
  SemanticSpan,
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

    attributes,
  };

  /*
   * Framework
   *
   * Keep framework-specific attributes.
   * Terrax should understand external instrumentations
   * instead of requiring them to emit Terrax-specific data.
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
   *
   * LangSmith first.
   *
   * gen_ai.provider.name is used as a fallback for
   * generic OpenTelemetry GenAI instrumentation.
   */
  const provider =
    getString(
      attributes,
      "langsmith.metadata.ls_provider"
    ) ??
    getString(
      attributes,
      "gen_ai.provider.name"
    );

  if (provider) {
    semanticSpan.provider = provider;
  }

  /*
   * Model
   *
   * Prefer request model.
   * Fall back to response model.
   */
  const model =
    getString(
      attributes,
      "gen_ai.request.model"
    ) ??
    getString(
      attributes,
      "gen_ai.response.model"
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

  /*
   * Reasoning tokens
   *
   * Terrax SDK emits this directly.
   *
   * If another instrumentation stores reasoning
   * information inside its messages, we also attempt
   * the existing fallback extraction below.
   */
  const reasoningTokens =
    getNumber(
      attributes,
      "gen_ai.usage.reasoning.output_tokens"
    );

  if (reasoningTokens !== undefined) {
    semanticSpan.reasoningTokens =
      reasoningTokens;
  }

  /*
   * Status
   */
  if (span.status) {
    semanticSpan.status = span.status;
  }

  /*
   * Input normalization
   *
   * Supported sources:
   *
   * 1. Current OTel GenAI:
   *      gen_ai.input.messages
   *
   * 2. Existing / older GenAI instrumentation:
   *      gen_ai.prompt
   *
   * 3. Terrax SDK generic:
   *      terrax.input
   *
   * The first available value wins.
   */
  const prompt =
    getJson(
      attributes,
      "gen_ai.input.messages"
    ) ??
    getJson(
      attributes,
      "gen_ai.prompt"
    ) ??
    getJson(
      attributes,
      "terrax.input"
    );

  if (prompt !== undefined) {
    semanticSpan.prompt = prompt;
  }

  /*
   * Output normalization
   *
   * Supported sources:
   *
   * 1. Current OTel GenAI:
   *      gen_ai.output.messages
   *
   * 2. Existing / older GenAI instrumentation:
   *      gen_ai.completion
   *
   * 3. Terrax SDK generic:
   *      terrax.output
   */
  const completion =
    getJson(
      attributes,
      "gen_ai.output.messages"
    ) ??
    getJson(
      attributes,
      "gen_ai.completion"
    ) ??
    getJson(
      attributes,
      "terrax.output"
    );

  if (completion !== undefined) {
    semanticSpan.completion = completion;
  }

  /*
   * AI-specific extraction
   *
   * Generic @observe() spans remain generic.
   */
  const isAiSpan =
    semanticSpan.type === "llm" ||
    semanticSpan.type === "tool" ||
    semanticSpan.type === "workflow" ||
    semanticSpan.type === "workflow_node";

  if (isAiSpan) {
    /*
     * Tool calls embedded inside model input messages.
     *
     * Example:
     *
     * {
     *   messages: [
     *     {
     *       role: "assistant",
     *       parts: [
     *         {
     *           type: "tool_call",
     *           ...
     *         }
     *       ]
     *     }
     *   ]
     * }
     */
    const toolCalls =
      extractToolCalls(prompt);

    if (toolCalls.length > 0) {
      semanticSpan.toolCalls =
        toolCalls;
    }

    /*
     * Direct tool input.
     *
     * Terrax @observe_tool emits:
     *
     * gen_ai.tool.call.arguments
     *
     * If unavailable, fall back to the existing
     * message-based extraction.
     */
    const directToolInput =
      getJson(
        attributes,
        "gen_ai.tool.call.arguments"
      );

    if (directToolInput !== undefined) {
      semanticSpan.toolInput =
        directToolInput;
    } else {
      const toolInput =
        extractToolInput(prompt);

      if (toolInput !== undefined) {
        semanticSpan.toolInput =
          toolInput;
      }
    }

    /*
     * Direct tool output.
     *
     * Terrax @observe_tool emits:
     *
     * gen_ai.tool.call.result
     *
     * If unavailable, fall back to the existing
     * message-based extraction.
     */
    const directToolOutput =
      getJson(
        attributes,
        "gen_ai.tool.call.result"
      );

    if (directToolOutput !== undefined) {
      semanticSpan.toolOutput =
        directToolOutput;
    } else {
      const toolOutput =
        extractToolOutput(completion);

      if (toolOutput !== undefined) {
        semanticSpan.toolOutput =
          toolOutput;
      }
    }

    /*
     * Backward-compatible reasoning extraction.
     */
    if (
      semanticSpan.reasoningTokens ===
      undefined
    ) {
      const extractedReasoning =
        extractReasoningTokens(prompt);

      if (
        extractedReasoning !==
        undefined
      ) {
        semanticSpan.reasoningTokens =
          extractedReasoning;
      }
    }
  }

  /*
   * Error
   */
  const error = extractError(
    attributes,
    span.events
  );

  if (error) {
    semanticSpan.errorType =
      error.type;

    semanticSpan.errorMessage =
      error.message;
  }

  return semanticSpan;
}

/*
 * --------------------------------------------------
 * Attribute helpers
 * --------------------------------------------------
 */

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

  /*
   * OTLP decoding may give us either:
   *
   * - a JSON string
   * - an already parsed object
   *
   * Support both.
   */
  if (
    value !== null &&
    typeof value === "object"
  ) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

/*
 * --------------------------------------------------
 * Tool extraction
 * --------------------------------------------------
 */

function extractToolCalls(
  prompt: unknown
): unknown[] {
  if (
    !prompt ||
    typeof prompt !== "object"
  ) {
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

    const messageObject =
      message as {
        tool_calls?: unknown;
        parts?: unknown;
      };

    /*
     * LangChain / existing instrumentation
     */
    if (
      Array.isArray(
        messageObject.tool_calls
      )
    ) {
      for (
        const call of
          messageObject.tool_calls
      ) {
        toolCalls.push(call);
      }
    }

    /*
     * OTel GenAI message format
     */
    if (
      Array.isArray(
        messageObject.parts
      )
    ) {
      for (
        const part of
          messageObject.parts
      ) {
        if (
          !part ||
          typeof part !== "object"
        ) {
          continue;
        }

        const partObject =
          part as {
            type?: unknown;
          };

        if (
          partObject.type ===
          "tool_call"
        ) {
          toolCalls.push(part);
        }
      }
    }
  }

  return toolCalls;
}

function extractToolInput(
  prompt: unknown
): unknown | undefined {
  if (
    !prompt ||
    typeof prompt !== "object"
  ) {
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
  if (
    !completion ||
    typeof completion !== "object"
  ) {
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

/*
 * --------------------------------------------------
 * Reasoning extraction
 * --------------------------------------------------
 */

function extractReasoningTokens(
  prompt: unknown
): number | undefined {
  if (
    !prompt ||
    typeof prompt !== "object"
  ) {
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
      typeof usageMetadata !==
        "object"
    ) {
      continue;
    }

    const outputTokenDetails = (
      usageMetadata as {
        output_token_details?:
          unknown;
      }
    ).output_token_details;

    if (
      !outputTokenDetails ||
      typeof outputTokenDetails !==
        "object"
    ) {
      continue;
    }

    const reasoning = (
      outputTokenDetails as {
        reasoning?: unknown;
      }
    ).reasoning;

    if (
      typeof reasoning === "number"
    ) {
      return reasoning;
    }
  }

  return undefined;
}

/*
 * --------------------------------------------------
 * Error extraction
 * --------------------------------------------------
 */

function extractError(
  attributes: Record<string, unknown>,
  events?: unknown[]
): {
  type?: string;
  message?: string;
} | undefined {
  /*
   * First check normalized error attributes.
   */
  const errorType = getString(
    attributes,
    "error.type"
  );

  const errorMessage = getString(
    attributes,
    "error.message"
  );

  if (
    errorType ||
    errorMessage
  ) {
    return {
      type: errorType,
      message: errorMessage,
    };
  }

  if (!events) {
    return undefined;
  }

  /*
   * Then inspect OTel exception events.
   */
  for (const event of events) {
    if (
      !event ||
      typeof event !== "object"
    ) {
      continue;
    }

    const eventObject =
      event as {
        name?: unknown;
        attributes?: unknown;
      };

    if (
      eventObject.name !==
      "exception"
    ) {
      continue;
    }

    if (
      !eventObject.attributes ||
      !Array.isArray(
        eventObject.attributes
      )
    ) {
      continue;
    }

    let exceptionType:
      | string
      | undefined;

    let exceptionMessage:
      | string
      | undefined;

    for (
      const attribute of
        eventObject.attributes
    ) {
      if (
        !attribute ||
        typeof attribute !==
          "object"
      ) {
        continue;
      }

      const item =
        attribute as {
          key?: unknown;
          value?: unknown;
        };

      if (
        typeof item.key !==
          "string" ||
        !item.value ||
        typeof item.value !==
          "object"
      ) {
        continue;
      }

      const value =
        item.value as {
          stringValue?: unknown;
        };

      if (
        typeof value.stringValue !==
          "string"
      ) {
        continue;
      }

      if (
        item.key ===
        "exception.type"
      ) {
        exceptionType =
          value.stringValue;
      }

      if (
        item.key ===
        "exception.message"
      ) {
        exceptionMessage =
          value.stringValue;
      }
    }

    if (
      exceptionType ||
      exceptionMessage
    ) {
      return {
        type: exceptionType,
        message:
          exceptionMessage,
      };
    }
  }

  return undefined;
}
