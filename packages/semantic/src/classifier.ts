import type { RawSpan, SemanticType } from "./types.js";

export function classifySpan(span: RawSpan): SemanticType {
  const attributes = span.attributes;

  const spanKind = getStringAttribute(
    attributes,
    "langsmith.span.kind"
  );

  const genAiOperation = getStringAttribute(
    attributes,
    "gen_ai.operation.name"
  );

  const langgraphNode = getStringAttribute(
    attributes,
    "langgraph.node"
  );

  const spanName = span.name.toLowerCase();

  // Strong framework-specific signals
  if (spanKind === "llm") {
    return "llm";
  }

  if (spanKind === "tool") {
    return "tool";
  }

  if (langgraphNode) {
    return "workflow_node";
  }

  // Standard GenAI semantic conventions
  if (genAiOperation === "chat") {
    return "llm";
  }

  if (genAiOperation === "execute_tool") {
    return "tool";
  }

  // Generic workflow hints
  if (
    spanKind === "chain" &&
    !genAiOperation
  ) {
    if (
      spanName.includes("graph") ||
      spanName.includes("workflow") ||
      spanName.includes("agent")
    ) {
      return "workflow";
    }

    return "workflow_node";
  }

  return "generic";
}

function getStringAttribute(
  attributes: Record<string, unknown>,
  key: string
): string | undefined {
  const value = attributes[key];

  if (typeof value !== "string") {
    return undefined;
  }

  return value;
}