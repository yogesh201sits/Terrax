import { Hono } from "hono";
import type { AppVariables } from "./types";
import traces from "./routes/traces";

const app = new Hono<{
  Variables: AppVariables;
}>();

app.route("/v1", traces);

export default app;