import { describe, expect, test } from "bun:test";
import { classifySpan } from "../src/classifier";
import type { RawSpan } from "../src/types";

describe("classifySpan", () => {
  test("classifies LangChain LLM span", () => {
    const span: RawSpan = {
      traceId: "trace-1",
      spanId: "span-1",
      name: "ChatGroq",
      startTime: "2026-09-02T00:00:00Z",
      endTime: "2026-09-02T00:00:01Z",
      attributes: {
        "langsmith.span.kind": "llm",
        "gen_ai.operation.name": "chat",
        "gen_ai.request.model": "openai/gpt-oss-120b"
      }
    };

    expect(classifySpan(span)).toBe("llm");
  });

  test("classifies LangChain tool span", () => {
    const span: RawSpan = {
      traceId: "trace-1",
      spanId: "span-2",
      name: "get_weather",
      startTime: "2026-09-02T00:00:00Z",
      endTime: "2026-09-02T00:00:01Z",
      attributes: {
        "langsmith.span.kind": "tool",
        "gen_ai.operation.name": "execute_tool"
      }
    };

    expect(classifySpan(span)).toBe("tool");
  });

  test("classifies generic GenAI chat span without LangChain", () => {
    const span: RawSpan = {
      traceId: "trace-2",
      spanId: "span-3",
      name: "my-company-llm",
      startTime: "2026-09-02T00:00:00Z",
      endTime: "2026-09-02T00:00:01Z",
      attributes: {
        "gen_ai.operation.name": "chat",
        "gen_ai.request.model": "gpt-5"
      }
    };

    expect(classifySpan(span)).toBe("llm");
  });

  test("falls back to generic", () => {
    const span: RawSpan = {
      traceId: "trace-3",
      spanId: "span-4",
      name: "custom_operation",
      startTime: "2026-09-02T00:00:00Z",
      endTime: "2026-09-02T00:00:01Z",
      attributes: {}
    };

    expect(classifySpan(span)).toBe("generic");
  });
});