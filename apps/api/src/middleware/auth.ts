import { createHash } from "node:crypto";
import { prisma } from "@terrax/database";
import { createMiddleware } from "hono/factory";
import type { AppVariables } from "../types";

export const authMiddleware = createMiddleware<{
  Variables: AppVariables;
}>(async (c, next) => {
  const authorization = c.req.header("Authorization");

  if (!authorization) {
    return c.json(
      {
        error: "Missing Authorization header",
      },
      401,
    );
  }

  if (!authorization.startsWith("Bearer ")) {
    return c.json(
      {
        error: "Invalid Authorization header",
      },
      401,
    );
  }

  const apiKey = authorization.slice("Bearer ".length).trim();

  if (!apiKey) {
    return c.json(
      {
        error: "Missing API key",
      },
      401,
    );
  }

  const keyHash = createHash("sha256")
    .update(apiKey)
    .digest("hex");

  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: {
      keyHash,
    },
    select: {
      projectId: true,
    },
  });

  if (!apiKeyRecord) {
    return c.json(
      {
        error: "Invalid API key",
      },
      401,
    );
  }

  c.set("projectId", apiKeyRecord.projectId);

  await next();
});