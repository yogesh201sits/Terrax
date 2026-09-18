import { Hono } from "hono";

import { prisma } from "@terrax/database";

import { clerkAuthMiddleware } from "../middleware/clerk-auth";
import { createNotification } from "../services/notifications/notification-service";
import { NotificationType } from "../services/notifications/types";
import type { AppVariables } from "../types";

const projects = new Hono<{
  Variables: AppVariables;
}>();

/**
 * Create project
 */
projects.post(
  "/projects",
  clerkAuthMiddleware,
  async (c) => {
    const userId = c.get("userId");

    const body = await c.req.json<{
      name?: string;
    }>();

    if (!body.name?.trim()) {
      return c.json(
        {
          error: "Project name is required",
        },
        400,
      );
    }

    const project = await prisma.project.create({
      data: {
        name: body.name.trim(),
        userId,
      },
    });

    await createNotification({
      userId,
      projectId: project.id,
      type: NotificationType.PROJECT_CREATED,
      title: "Project created",
      message: `Project "${project.name}" was created.`,
      metadata: {
        projectId: project.id,
      },
    });

    return c.json(
      {
        project,
      },
      201,
    );
  },
);

/**
 * Get current user's projects
 */
projects.get(
  "/projects",
  clerkAuthMiddleware,
  async (c) => {
    const userId = c.get("userId");

    const projects = await prisma.project.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({
      projects,
    });
  },
);

/**
 * Get project
 */
projects.get(
  "/projects/:projectId",
  clerkAuthMiddleware,
  async (c) => {
    const userId = c.get("userId");
    const projectId = c.req.param("projectId");

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
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

    return c.json({
      project,
    });
  },
);

/**
 * Update project
 */
projects.patch(
  "/projects/:projectId",
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
          error: "Project name is required",
        },
        400,
      );
    }

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
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

    const updatedProject = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        name: body.name.trim(),
      },
    });

    await createNotification({
      userId,
      projectId: updatedProject.id,
      type: NotificationType.PROJECT_UPDATED,
      title: "Project updated",
      message: `Project "${updatedProject.name}" was updated.`,
      metadata: {
        projectId: updatedProject.id,
      },
    });

    return c.json({
      project: updatedProject,
    });
  },
);

/**
 * Delete project
 */
projects.delete(
  "/projects/:projectId",
  clerkAuthMiddleware,
  async (c) => {
    const userId = c.get("userId");
    const projectId = c.req.param("projectId");

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
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

    await prisma.project.delete({
      where: {
        id: projectId,
      },
    });

    await createNotification({
      userId,
      type: NotificationType.PROJECT_DELETED,
      title: "Project deleted",
      message: `Project "${project.name}" was deleted.`,
      metadata: {
        projectId: project.id,
        projectName: project.name,
      },
    });

    return c.body(null, 204);
  },
);

export default projects;
