import { Hono } from "hono";

import { prisma } from "@terrax/database";

import { clerkAuthMiddleware } from "../middleware/clerk-auth";
import type { AppVariables } from "../types";

const projects = new Hono<{
  Variables: AppVariables;
}>();

projects.post("/projects", clerkAuthMiddleware, async (c) => {
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

  return c.json(
    {
      project,
    },
    201,
  );
});

projects.get("/projects", clerkAuthMiddleware, async (c) => {
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
});

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

    return c.json({
      project: updatedProject,
    });
  },
);

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

    return c.body(null, 204);
  },
);

export default projects;