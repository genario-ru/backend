import { auth } from "@/auth";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const authRoute = createHonoApp().basePath("/auth");

// POST, GET /api/auth/*
authRoute.on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});
