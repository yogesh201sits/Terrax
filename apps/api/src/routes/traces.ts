import { Hono } from "hono";
import { decodeTraces, normalizeTraces } from "@terrax/otel";
import { ingestTraces } from "../services/trace-ingestion";
import { authMiddleware } from "../middleware/auth";
import type { AppVariables } from "../types";

const traces = new Hono<{
  Variables: AppVariables;
}>();

traces.post(
  "/traces",
  authMiddleware,
  async (c) => {
    const body = await c.req.arrayBuffer();
    const payload = new Uint8Array(body);

    const decoded = decodeTraces(payload);
    const normalized = normalizeTraces(decoded);

    const projectId = c.get("projectId");

    await ingestTraces(projectId, normalized);

    return c.body(null, 200);
  },
);

export default traces;