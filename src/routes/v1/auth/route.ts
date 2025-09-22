import { auth } from "@/auth";
import { createHonoApp } from "@/lib/create-hono-app";

export const authRoutes = createHonoApp();

authRoutes.on(['POST', 'GET'], '/auth/**', (c) => {
  return auth.handler(c.req.raw)
})
