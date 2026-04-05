import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const rootRoute = createHonoApp().basePath("/");

// GET /
rootRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "root",
    windowMs: 60 * 1000,
    limit: 20,
  }),
  async (c) => {
    return c.json({ message: "Hello, world!" });
  },
);
