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

  const integration = getStringAttribute(
    attributes,
    "langsmith.metadata.ls_integration",
  );

  const spanName = span.name.toLowerCase();

  // Strong LLM signal
  if (spanKind === "llm") {
    return "llm";
  }

  // Strong tool signal
  if (spanKind === "tool") {
    return "tool";
  }

  // LangGraph node
  if (langgraphNode) {
    return "workflow_node";
  }

  // LangGraph root workflow
  if (
    traceName === "LangGraph" &&
    genAiOperation === "chain"
  ) {
    return "workflow";
  }

  // Other obvious workflow roots
  if (
    spanName.includes("graph") ||
    spanName.includes("workflow")
  ) {
    return "workflow";
  }

  // Generic GenAI LLM
  if (
    genAiOperation === "chat"
  ) {
    return "llm";
  }

  // Generic tool execution
  if (
    genAiOperation === "execute_tool"
  ) {
    return "tool";
  }

  // LangChain chain without LangGraph node metadata
  if (
    spanKind === "chain" &&
    integration?.startsWith("langchain")
  ) {
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