import { db } from "@/db";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { getTonesResponseSchema, type GetTonesResponse } from "@/schemas/entities/tones/handlers/get-tones/response";
import { createHonoApp } from "@/utils/create-hono-app";

export const getTonesRoute = createHonoApp().basePath("/tones");

// GET /api/v1/tones
getTonesRoute.get("/", sessionMiddleware, async (c) => {
  const foundTones = await db.query.tone.findMany();

  return c.json<GetTonesResponse>(
    getTonesResponseSchema.parse({
      data: foundTones
    }),
  );
});