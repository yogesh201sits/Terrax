import { describe, expect, test } from "bun:test";
import { buildTraceTree } from "../src/tree.js";
import type { SemanticSpan } from "../src/types.js";

function createSpan(
  spanId: string,
  parentSpanId: string | null,
  name: string
): SemanticSpan {
  return {
    traceId: "trace-1",
    spanId,
    parentSpanId,
    type: "generic",
    name,
    startTime: "2026-09-02T00:00:00Z",
    endTime: "2026-09-02T00:00:01Z",
    attributes: {}
  };
}

describe("buildTraceTree", () => {
  test("builds parent child relationships", () => {
    const spans = [
      createSpan("root", null, "LangGraph"),
      createSpan("model", "root", "model"),
      createSpan("llm", "model", "ChatGroq"),
      createSpan("tools", "root", "tools"),
      createSpan("tool", "tools", "get_weather")
    ];

    const tree = buildTraceTree(spans);

    expect(tree.traceId).toBe("trace-1");
    expect(tree.roots.length).toBe(1);

    const root = tree.roots[0];

    expect(root.span.name).toBe("LangGraph");
    expect(root.children.length).toBe(2);

    expect(root.children[0].span.name).toBe("model");
    expect(root.children[0].children[0].span.name).toBe("ChatGroq");

    expect(root.children[1].span.name).toBe("tools");
    expect(root.children[1].children[0].span.name).toBe(
      "get_weather"
    );
  });

  test("handles orphan spans as roots", () => {
    const spans = [
      createSpan("root", null, "LangGraph"),
      createSpan("orphan", "missing-parent", "orphan")
    ];

    const tree = buildTraceTree(spans);

    expect(tree.roots.length).toBe(2);
    expect(tree.roots[1].span.name).toBe("orphan");
  });

  test("handles empty trace", () => {
    const tree = buildTraceTree([]);

    expect(tree.traceId).toBe("");
    expect(tree.roots.length).toBe(0);
  });
});