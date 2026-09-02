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
test("extracts error information", () => {
  const span = {
    traceId: "trace-1",
    spanId: "span-1",
    parentSpanId: null,
    name: "ChatGroq",
    startTime: "2026-09-01T18:59:15.689Z",
    endTime: "2026-09-01T18:59:16.540Z",
    status: "ERROR",
    attributes: {
      "error.type": "RateLimitError",
      "error.message": "Rate limit exceeded",
    },
  };

  const result = extractSemanticSpan(span);

  expect(result.status).toBe("ERROR");
  expect(result.errorType).toBe("RateLimitError");
  expect(result.errorMessage).toBe("Rate limit exceeded");
});
});