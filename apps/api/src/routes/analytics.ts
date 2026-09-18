import { Hono } from "hono";

import { prisma } from "@terrax/database";

import { clerkAuthMiddleware } from "../middleware/clerk-auth";
import {
  getAgentAnalytics,
  getLlmAnalytics,
  getToolAnalytics,
  type AnalyticsRange,
} from "../services/analytics/analytics-service";
import type { AppVariables } from "../types";

const analytics = new Hono<{
  Variables: AppVariables;
}>();

const VALID_RANGES: AnalyticsRange[] = [
  "24h",
  "7d",
  "30d",
  "all",
];

function getRange(value?: string): AnalyticsRange {
  if (
    value &&
    VALID_RANGES.includes(value as AnalyticsRange)
  ) {
    return value as AnalyticsRange;
  }

  return "24h";
}

function getLimit(value?: string): number {
  const limit = Number(value ?? "20");

  if (!Number.isFinite(limit)) {
    return 20;
  }

  return Math.min(
    Math.max(Math.floor(limit), 1),
    100,
  );
}

analytics.get(
  "/projects/:projectId/analytics/agents",
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
      return c.json(
        {
          error: "Project not found",
        },
        404,
      );
    }

    const range = getRange(
      c.req.query("range"),
    );

    const limit = getLimit(
      c.req.query("limit"),
    );

    const result = await getAgentAnalytics(
      projectId,
      range,
      limit,
    );

    return c.json(result);
  },
);

analytics.get(
  "/projects/:projectId/analytics/llms",
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
      return c.json(
        {
          error: "Project not found",
        },
        404,
      );
    }

    const llms = await getLlmAnalytics(
      projectId,
    );

    return c.json({
      llms,
    });
  },
);

analytics.get(
  "/projects/:projectId/analytics/tools",
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
      return c.json(
        {
          error: "Project not found",
        },
        404,
      );
    }

    const range = getRange(
      c.req.query("range"),
    );

    const limit = getLimit(
      c.req.query("limit"),
    );

    const result = await getToolAnalytics(
      projectId,
      range,
      limit,
    );

    return c.json(result);
  },
);

export default analytics;