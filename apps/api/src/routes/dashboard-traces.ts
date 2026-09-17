import { Hono } from "hono";

import { prisma } from "@terrax/database";

import { clerkAuthMiddleware } from "../middleware/clerk-auth";
import { getTrace, listTraces } from "../services/trace-query";
import type { AppVariables } from "../types";

const dashboardTraces = new Hono<{
  Variables: AppVariables;
}>();

dashboardTraces.get(
  "/projects/:projectId/traces",
  clerkAuthMiddleware,
  async (c) => {
    const userId = c.get("userId");
    const projectId = c.req.param("projectId");

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    const traces = await listTraces(projectId);

    return c.json({ traces });
  },
);

dashboardTraces.get(
  "/projects/:projectId/traces/:traceId",
  clerkAuthMiddleware,
  async (c) => {
    const userId = c.get("userId");
    const projectId = c.req.param("projectId");
    const traceId = c.req.param("traceId");

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!project) {
      return c.json({ error: "Project not found" }, 404);
    }

    const trace = await getTrace(projectId, traceId);

    if (!trace) {
      return c.json({ error: "Trace not found" }, 404);
    }

    return c.json(trace);
  },
);

export default dashboardTraces;