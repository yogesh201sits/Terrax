import { createClerkClient } from "@clerk/backend";
import { createMiddleware } from "hono/factory";

import type { AppVariables } from "../types";

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
});

export const clerkAuthMiddleware = createMiddleware<{
  Variables: AppVariables;
}>(async (c, next) => {
  const { isAuthenticated, toAuth } =
    await clerk.authenticateRequest(c.req.raw, {
      authorizedParties: ["http://localhost:3001"],
    });

  if (!isAuthenticated) {
    return c.json(
      {
        error: "Unauthorized",
      },
      401,
    );
  }

  const auth = toAuth();

  if (!auth.userId) {
    return c.json(
      {
        error: "User not found",
      },
      401,
    );
  }

  c.set("userId", auth.userId);

  await next();
});