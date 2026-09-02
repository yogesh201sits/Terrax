import type { RawSpan, SemanticType } from "./types.js";

export function classifySpan(span: RawSpan): SemanticType {
  const attributes = span.attributes;

  const spanKind = getStringAttribute(
    attributes,
    "langsmith.span.kind",
  );

  const genAiOperation = getStringAttribute(
    attributes,
    "gen_ai.operation.name",
  );

  const langgraphNode = getStringAttribute(
    attributes,
    "langsmith.metadata.langgraph_node",
  );

  const traceName = getStringAttribute(
    attributes,
    "langsmith.trace.name",
  );

  const spanName = span.name.toLowerCase();

  if (spanKind === "llm") {
    return "llm";
  }

  if (spanKind === "tool") {
    return "tool";
  }

  if (langgraphNode) {
    return "workflow_node";
  }

  if (
    traceName === "LangGraph" ||
    spanName.includes("graph") ||
    spanName.includes("workflow") ||
    spanName.includes("agent")
  ) {
    return "workflow";
  }

  if (genAiOperation === "chat") {
    return "llm";
  }

  if (genAiOperation === "execute_tool") {
    return "tool";
  }

  if (spanKind === "chain") {
    return "workflow_node";
  }

  return "generic";
}

function getStringAttribute(
  attributes: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = attributes[key];

  if (typeof value === "string") {
    return value;
  }

  return undefined;
}