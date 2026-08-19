import app from "./index";

const port = Number(process.env.PORT ?? 3000);

Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`Terrax API running on http://localhost:${port}`);