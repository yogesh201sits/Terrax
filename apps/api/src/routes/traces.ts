import { Hono } from "hono";
import { decodeTraces, normalizeTraces } from "@terrax/otel";
import { ingestTraces } from "../services/trace-ingestion";
import { getTrace,listTraces } from "../services/trace-query";
import { authMiddleware } from "../middleware/auth";
import type { AppVariables } from "../types";

const traces = new Hono<{
  Variables: AppVariables;
}>();

traces.get(
  "/",
  authMiddleware,
  async (c) => {
    const projectId = c.get("projectId");

    const traces = await listTraces(projectId);

    return c.json({
      traces,
    });
  },
);

// traces.post(
//   "/traces",
//   authMiddleware,
//   async (c) => {
//     const body = await c.req.arrayBuffer();
//     const payload = new Uint8Array(body);

//     const decoded = decodeTraces(payload);
//     const normalized = normalizeTraces(decoded);

//     const projectId = c.get("projectId");

//     await ingestTraces(projectId, normalized);

//     return c.body(null, 200);
//   },
// );
traces.post(
  "/traces",
  authMiddleware,
  async (c) => {
    console.log("[TRACES] Request received");

    const body = await c.req.arrayBuffer();
    console.log("[TRACES] Body received:", body.byteLength);

    const payload = new Uint8Array(body);

    console.log("[TRACES] Decoding...");
    const decoded = decodeTraces(payload);
    console.log("[TRACES] Decoding completed");

    console.log("[TRACES] Normalizing...");
    const normalized = normalizeTraces(decoded);
    console.log("[TRACES] Normalizing completed");

    const projectId = c.get("projectId");

    console.log("[TRACES] Ingesting...");
    await ingestTraces(projectId, normalized);
    console.log("[TRACES] Ingestion completed");

    console.log("[TRACES] Returning 200");

    return c.body(null, 200);
  },
);

traces.get(
  "/traces/:traceId",
  authMiddleware,
  async (c) => {
    const projectId = c.get("projectId");
    const traceId = c.req.param("traceId");

    const trace = await getTrace(projectId, traceId);

    if (!trace) {
      return c.json(
        {
          error: "Trace not found",
        },
        404,
      );
    }

    return c.json(trace);
  },
);

export default traces;