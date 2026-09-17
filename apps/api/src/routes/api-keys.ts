import { randomBytes, createHash } from "node:crypto";

import { prisma } from "@terrax/database";
import { Hono } from "hono";

import { clerkAuthMiddleware } from "../middleware/clerk-auth";
import type { AppVariables } from "../types";

const apiKeys = new Hono<{
  Variables: AppVariables;
}>();

apiKeys.post(
  "/projects/:projectId/api-keys",
  clerkAuthMiddleware,
  async (c) => {
    const userId = c.get("userId");
    const projectId = c.req.param("projectId");

    const body = await c.req.json<{
      name?: string;
    }>();

    if (!body.name?.trim()) {
      return c.json(
        {
          error: "API key name is required",
        },
        400,
      );
    }

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

    const secret = randomBytes(32).toString("hex");

    const apiKey = `TRX_${secret}`;

    const keyHash = createHash("sha256")
      .update(apiKey)
      .digest("hex");

    const keyPrefix = apiKey.slice(0, 12);

    const record = await prisma.apiKey.create({
      data: {
        name: body.name.trim(),
        keyHash,
        keyPrefix,
        projectId,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        projectId: true,
        createdAt: true,
      },
    });

    return c.json(
      {
        apiKey,
        key: record,
      },
      201,
    );
  },
);

apiKeys.get(
  "/projects/:projectId/api-keys",
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

    const keys = await prisma.apiKey.findMany({
      where: {
        projectId,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        createdAt: true,
        lastUsedAt: true,
        revokedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({
      keys,
    });
  },
);

apiKeys.delete(
  "/projects/:projectId/api-keys/:keyId",
  clerkAuthMiddleware,
  async (c) => {
    const userId = c.get("userId");
    const projectId = c.req.param("projectId");
    const keyId = c.req.param("keyId");

    const apiKey = await prisma.apiKey.findFirst({
      where: {
        id: keyId,
        projectId,
        project: {
          userId,
        },
      },
      select: {
        id: true,
        revokedAt: true,
      },
    });

    if (!apiKey) {
      return c.json(
        {
          error: "API key not found",
        },
        404,
      );
    }

    if (apiKey.revokedAt) {
      return c.json(
        {
          error: "API key already revoked",
        },
        400,
      );
    }

    await prisma.apiKey.update({
      where: {
        id: keyId,
      },
      data: {
        revokedAt: new Date(),
      },
    });

    return c.body(null, 204);
  },
);

export default apiKeys;