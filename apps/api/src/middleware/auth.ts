import { createHash } from "node:crypto";

import { prisma } from "@terrax/database";
import { createMiddleware } from "hono/factory";

import type { AppVariables } from "../types";

export const authMiddleware = createMiddleware<{
  Variables: AppVariables;
}>(async (c, next) => {
  console.log("[AUTH] Middleware started");

  const authorization = c.req.header("Authorization");

  console.log("[AUTH] Authorization header:", authorization);

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

  console.log("[AUTH] API key received:", apiKey);
  console.log("[AUTH] API key length:", apiKey.length);

  if (!apiKey) {
    return c.json(
      {
        error: "Missing API key",
      },
      401,
    );
  }

  // Hash the API key before database lookup
  const keyHash = createHash("sha256")
    .update(apiKey)
    .digest("hex");

  console.log("[AUTH] Generated key hash:", keyHash);

  const apiKeyRecord = await prisma.apiKey.findUnique({
    where: {
      keyHash,
    },
    select: {
      projectId: true,
    },
  });

  console.log("[AUTH] Database result:", apiKeyRecord);

  if (!apiKeyRecord) {
    console.log("[AUTH] API key NOT FOUND in database");

    return c.json(
      {
        error: "Invalid API key",
      },
      401,
    );
  }

  console.log("[AUTH] API key valid");
  console.log("[AUTH] projectId:", apiKeyRecord.projectId);

  c.set("projectId", apiKeyRecord.projectId);

  console.log("[AUTH] projectId stored in context");

  await next();

  console.log("[AUTH] Middleware completed");
});