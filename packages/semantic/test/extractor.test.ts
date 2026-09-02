import { describe, expect, test } from "bun:test";

import { extractSemanticSpan } from "../src/extractor.js";

describe("extractSemanticSpan", () => {
  test("preserves span status", () => {
    const span = {
      traceId: "trace-1",
      spanId: "span-1",
      parentSpanId: null,

      name: "ChatGroq",

      startTime: "2026-09-01T18:59:15.689Z",
      endTime: "2026-09-01T18:59:16.540Z",

      status: "OK",

      attributes: {},
    };

    const result = extractSemanticSpan(span);

    expect(result.status).toBe("OK");
  });
});