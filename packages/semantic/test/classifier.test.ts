import { describe, expect, test } from "bun:test";
import { classifySpan } from "../src/classifier.js";
import { extractSemanticSpan } from "../src/extractor.js";
import type { RawSpan } from "../src/types.js";

describe("classifySpan", () => {
  test("classifies LangChain LLM span", () => {
    const span: RawSpan = {
      traceId: "trace-1",
      spanId: "span-1",
      parentSpanId: "parent-1",
      name: "ChatGroq",
     startTime: "2026-09-02T10:00:00.000Z",
endTime: "2026-09-02T10:00:01.000Z",
      status: "OK",
      attributes: {
        "langsmith.span.kind": "llm",
        "gen_ai.operation.name": "chat",
        "gen_ai.request.model": "openai/gpt-oss-120b",
        "langsmith.metadata.ls_provider": "groq",
        "langsmith.metadata.ls_integration": "langchain_chat_model",
      },
      events: [],
      resource: {},
    };

    expect(classifySpan(span)).toBe("llm");
  });

  test("classifies LangChain tool span", () => {
    const span: RawSpan = {
      traceId: "trace-1",
      spanId: "span-2",
      parentSpanId: "parent-1",
      name: "get_weather",
     startTime: "2026-09-02T10:00:00.000Z",
endTime: "2026-09-02T10:00:01.000Z",
      status: "OK",
      attributes: {
        "langsmith.span.kind": "tool",
        "gen_ai.operation.name": "execute_tool",
      },
      events: [],
      resource: {},
    };

    expect(classifySpan(span)).toBe("tool");
  });

  test("classifies generic GenAI chat span without LangChain", () => {
    const span: RawSpan = {
      traceId: "trace-1",
      spanId: "span-3",
      parentSpanId: null,
      name: "chat",
      startTime: "2026-09-02T10:00:00.000Z",
endTime: "2026-09-02T10:00:01.000Z",
      status: "OK",
      attributes: {
        "gen_ai.operation.name": "chat",
        "gen_ai.request.model": "some-model",
      },
      events: [],
      resource: {},
    };

    expect(classifySpan(span)).toBe("llm");
  });

  test("classifies LangGraph root as workflow", () => {
    const span: RawSpan = {
      traceId: "trace-1",
      spanId: "span-4",
      parentSpanId: null,
      name: "LangGraph",
     startTime: "2026-09-02T10:00:00.000Z",
endTime: "2026-09-02T10:00:01.000Z",
      status: "OK",
      attributes: {
        "langsmith.span.kind": "chain",
        "langsmith.trace.name": "LangGraph",
        "gen_ai.operation.name": "chain",
        "langsmith.metadata.ls_integration":
          "langchain_create_agent",
      },
      events: [],
      resource: {},
    };

    expect(classifySpan(span)).toBe("workflow");
  });

  test("classifies LangGraph model node as workflow_node", () => {
    const span: RawSpan = {
      traceId: "trace-1",
      spanId: "span-5",
      parentSpanId: "root-1",
      name: "model",
     startTime: "2026-09-02T10:00:00.000Z",
endTime: "2026-09-02T10:00:01.000Z",
      status: "OK",
      attributes: {
        "langsmith.span.kind": "chain",
        "gen_ai.operation.name": "chain",
        "langsmith.metadata.langgraph_node": "model",
        "langsmith.metadata.langgraph_step": 1,
      },
      events: [],
      resource: {},
    };

    expect(classifySpan(span)).toBe("workflow_node");
  });

  test("classifies LangGraph tools node as workflow_node", () => {
    const span: RawSpan = {
      traceId: "trace-1",
      spanId: "span-6",
      parentSpanId: "root-1",
      name: "tools",
     startTime: "2026-09-02T10:00:00.000Z",
endTime: "2026-09-02T10:00:01.000Z",
      status: "OK",
      attributes: {
        "langsmith.span.kind": "chain",
        "gen_ai.operation.name": "chain",
        "langsmith.metadata.langgraph_node": "tools",
        "langsmith.metadata.langgraph_step": 2,
      },
      events: [],
      resource: {},
    };

    expect(classifySpan(span)).toBe("workflow_node");
  });

  test("classifies get_weather as tool", () => {
    const span: RawSpan = {
      traceId: "trace-1",
      spanId: "span-7",
      parentSpanId: "tools-1",
      name: "get_weather",
    startTime: "2026-09-02T10:00:00.000Z",
endTime: "2026-09-02T10:00:01.000Z",
      status: "OK",
      attributes: {
        "langsmith.span.kind": "tool",
        "gen_ai.operation.name": "execute_tool",
      },
      events: [],
      resource: {},
    };

    expect(classifySpan(span)).toBe("tool");
  });

  test("falls back to generic", () => {
    const span: RawSpan = {
      traceId: "trace-1",
      spanId: "span-8",
      parentSpanId: null,
      name: "unknown-operation",
    startTime: "2026-09-02T10:00:00.000Z",
endTime: "2026-09-02T10:00:01.000Z",
      status: "OK",
      attributes: {},
      events: [],
      resource: {},
    };

    expect(classifySpan(span)).toBe("generic");
  });
});

describe("extractSemanticSpan", () => {
  test("extracts LangChain framework, provider and model", () => {
    const span: RawSpan = {
      traceId: "trace-1",
      spanId: "span-9",
      parentSpanId: "parent-1",
      name: "ChatGroq",
    startTime: "2026-09-02T10:00:00.000Z",
endTime: "2026-09-02T10:00:01.000Z",
      status: "OK",
      attributes: {
        "langsmith.span.kind": "llm",
        "gen_ai.operation.name": "chat",
        "gen_ai.system": "openai",
        "gen_ai.request.model": "openai/gpt-oss-120b",
        "langsmith.metadata.ls_provider": "groq",
        "langsmith.metadata.ls_integration":
          "langchain_chat_model",
        "gen_ai.usage.input_tokens": 100,
        "gen_ai.usage.output_tokens": 50,
        "gen_ai.usage.total_tokens": 150,
      },
      events: [],
      resource: {},
    };

    const result = extractSemanticSpan(span);

    expect(result.type).toBe("llm");
    expect(result.framework).toBe("langchain");
    expect(result.provider).toBe("groq");
    expect(result.model).toBe("openai/gpt-oss-120b");

    expect(result.inputTokens).toBe(100);
    expect(result.outputTokens).toBe(50);
    expect(result.totalTokens).toBe(150);
  });
});