import { Hono } from "hono";

import type { AppVariables } from "./types";

import projects from "./routes/projects";
import traces from "./routes/traces";
import apiKeys from "./routes/api-keys";

const app = new Hono<{
  Variables: AppVariables;
}>();

app.get("/health", (c) => {
  return c.json({
    status: "ok",
  });
});

app.route("/v1", projects);
app.route("/v1", traces);
app.route("/v1", apiKeys);

export default app;