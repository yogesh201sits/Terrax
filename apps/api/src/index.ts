import { Hono } from "hono";
import type { AppVariables } from "./types";
import traces from "./routes/traces";

const app = new Hono<{
  Variables: AppVariables;
}>();

app.get("/health", (c) => {
  return c.json({
    status: "ok",
  });
});

app.route("/v1", traces);

export default app;