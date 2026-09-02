import type { SemanticSpan } from "./types.js";

export interface SemanticSpanNode {
  span: SemanticSpan;
  children: SemanticSpanNode[];
}

export interface SemanticTraceTree {
  traceId: string;
  roots: SemanticSpanNode[];
}

export function buildTraceTree(
  spans: SemanticSpan[]
): SemanticTraceTree {
  if (spans.length === 0) {
    return {
      traceId: "",
      roots: []
    };
  }

  const nodes = new Map<string, SemanticSpanNode>();

  for (const span of spans) {
    nodes.set(span.spanId, {
      span,
      children: []
    });
  }

  const roots: SemanticSpanNode[] = [];

  for (const span of spans) {
    const node = nodes.get(span.spanId);

    if (!node) {
      continue;
    }

    if (!span.parentSpanId) {
      roots.push(node);
      continue;
    }

    const parent = nodes.get(span.parentSpanId);

    if (!parent) {
      roots.push(node);
      continue;
    }

    parent.children.push(node);
  }

  return {
    traceId: spans[0].traceId,
    roots
  };
}