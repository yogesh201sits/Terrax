import { Hono } from "hono";

import { prisma } from "@terrax/database";

import { clerkAuthMiddleware } from "../middleware/clerk-auth";
import { getAgentAnalytics } from "../services/analytics/analytics-service";
import type { AppVariables } from "../types";
import {getLlmAnalytics,} from "../services/analytics/analytics-service";
import {
  getToolAnalytics,
} from "../services/analytics/analytics-service";

const analytics = new Hono<{
  Variables: AppVariables;
}>();

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

    const agents = await getAgentAnalytics(
      projectId,
    );

    return c.json({
      agents,
    });
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

    const tools = await getToolAnalytics(
      projectId,
    );

    return c.json({
      tools,
    });
  },
);

export default analytics;