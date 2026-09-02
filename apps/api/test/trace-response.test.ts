import { describe, expect, test } from "bun:test";

import {
  toTraceTreeNodeResponse,
} from "../src/services/trace-response";

describe("Trace Response", () => {
  test("converts semantic span tree into clean API response", () => {
    const tree = {
      span: {
        traceId: "trace-1",
        spanId: "span-1",
        parentSpanId: null,

        type: "workflow" as const,
        name: "LangGraph",

        startTime: "2026-09-01T18:59:15.376Z",
        endTime: "2026-09-01T18:59:16.814Z",

        attributes: {},

        framework: "langchain",
      },

      children: [],
    };

    const result = toTraceTreeNodeResponse(tree);

    expect(result.span.traceId).toBe("trace-1");
    expect(result.span.spanId).toBe("span-1");
    expect(result.span.parentSpanId).toBe(null);

    expect(result.span.type).toBe("workflow");
    expect(result.span.name).toBe("LangGraph");

    expect(result.span.framework).toBe("langchain");

    expect(result.span.durationMs).toBe(1438);

    expect(result.children).toEqual([]);
  });
  test("converts nested LangGraph execution tree", () => {
  const tree = {
    span: {
      traceId: "trace-1",
      spanId: "root",
      parentSpanId: null,
      type: "workflow" as const,
      name: "LangGraph",
      startTime: "2026-09-01T18:59:15.376Z",
      endTime: "2026-09-01T18:59:16.814Z",
      attributes: {},
      framework: "langchain",
    },

    children: [
      {
        span: {
          traceId: "trace-1",
          spanId: "model-node",
          parentSpanId: "root",
          type: "workflow_node" as const,
          name: "model",
          startTime: "2026-09-01T18:59:15.591Z",
          endTime: "2026-09-01T18:59:16.541Z",
          attributes: {},
          framework: "langchain",
        },

        children: [
          {
            span: {
              traceId: "trace-1",
              spanId: "llm",
              parentSpanId: "model-node",
              type: "llm" as const,
              name: "ChatGroq",
              startTime: "2026-09-01T18:59:15.689Z",
              endTime: "2026-09-01T18:59:16.540Z",
              attributes: {},
              framework: "langchain",
              provider: "groq",
              model: "openai/gpt-oss-120b",
              inputTokens: 137,
              outputTokens: 62,
              totalTokens: 199,
            },

            children: [],
          },
        ],
      },
    ],
  };

  const result = toTraceTreeNodeResponse(tree);

  expect(result.span.type).toBe("workflow");
  expect(result.span.name).toBe("LangGraph");

  expect(result.children.length).toBe(1);

  expect(result.children[0].span.type).toBe(
    "workflow_node",
  );

  expect(result.children[0].span.name).toBe("model");

  expect(result.children[0].children.length).toBe(1);

  const llm = result.children[0].children[0];

  expect(llm.span.type).toBe("llm");
  expect(llm.span.name).toBe("ChatGroq");
  expect(llm.span.provider).toBe("groq");
  expect(llm.span.model).toBe("openai/gpt-oss-120b");

  expect(llm.span.inputTokens).toBe(137);
  expect(llm.span.outputTokens).toBe(62);
  expect(llm.span.totalTokens).toBe(199);
  expect(llm.span.durationMs).toBe(851);
});
test("includes LLM semantic metadata", () => {
  const tree = {
    span: {
      traceId: "trace-1",
      spanId: "llm-1",
      parentSpanId: "model-1",

      type: "llm" as const,
      name: "ChatGroq",

      startTime: "2026-09-01T18:59:15.689Z",
      endTime: "2026-09-01T18:59:16.540Z",

      attributes: {},

      framework: "langchain",
      provider: "groq",
      model: "openai/gpt-oss-120b",

      inputTokens: 137,
      outputTokens: 62,
      totalTokens: 199,
      reasoningTokens: 34,

      prompt: {
        messages: [
          {
            content: "What is the weather in Pune?",
            type: "human",
          },
        ],
      },

      completion: {
        output: "The weather in Pune is sunny and 28°C.",
      },

      toolCalls: [
        {
          name: "get_weather",
          args: {
            city: "Pune",
          },
        },
      ],
    },

    children: [],
  };

  const result = toTraceTreeNodeResponse(tree);

  expect(result.span.type).toBe("llm");
  expect(result.span.name).toBe("ChatGroq");

  expect(result.span.provider).toBe("groq");
  expect(result.span.model).toBe(
    "openai/gpt-oss-120b"
  );

  expect(result.span.inputTokens).toBe(137);
  expect(result.span.outputTokens).toBe(62);
  expect(result.span.totalTokens).toBe(199);
  expect(result.span.reasoningTokens).toBe(34);

  expect(result.span.prompt).toEqual({
    messages: [
      {
        content: "What is the weather in Pune?",
        type: "human",
      },
    ],
  });

  expect(result.span.toolCalls).toEqual([
    {
      name: "get_weather",
      args: {
        city: "Pune",
      },
    },
  ]);
});
});