import { Hono } from "hono";

import type { AppVariables } from "./types";
import { cors } from "hono/cors";

import projects from "./routes/projects";
import traces from "./routes/traces";
import apiKeys from "./routes/api-keys";
import dashboardTraces from "./routes/dashboard-traces";

const app = new Hono<{
  Variables: AppVariables;
}>();

app.use(
  "*",
  cors({
    origin: "http://localhost:3001",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  }),
);

app.get("/health", (c) => {
  return c.json({
    status: "ok",
  });
});

app.route("/v1", projects);
app.route("/v1", apiKeys);
app.route("/v1", dashboardTraces);
app.route("/v1", traces);

export default app;