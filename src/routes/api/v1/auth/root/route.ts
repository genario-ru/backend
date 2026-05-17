import { auth } from "@/auth";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const betterAuthRoute = createHonoApp().basePath("/auth");

// GET /api/v1/auth/verify-email
betterAuthRoute.get("/verify-email", (c) => {
  return auth.handler(c.req.raw);
});

// GET /api/v1/auth/delete-user/callback
betterAuthRoute.get("/delete-user/callback", (c) => {
  return auth.handler(c.req.raw);
});

// GET /api/v1/auth/error
betterAuthRoute.get("/error", (c) => {
  return auth.handler(c.req.raw);
});

// GET /api/v1/auth/ok
betterAuthRoute.get("/ok", (c) => {
  return auth.handler(c.req.raw);
});
