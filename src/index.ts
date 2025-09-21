import { Hono } from "hono";
import type { AuthType } from "@/lib/auth"
import auth from "@/routes/auth";
import { serve } from "@hono/node-server";

const app = new Hono<{ Variables: AuthType }>({
  strict: false,
});

const routes = [auth] as const;

routes.forEach((route) => {
  app.basePath("/api").route("/", route);
});

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
