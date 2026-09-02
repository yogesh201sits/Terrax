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
   *
   * LangChain/LangGraph spans expose their integration
   * through langsmith.metadata.ls_integration.
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