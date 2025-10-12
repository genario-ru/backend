import { db } from "@/db";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { getTemplatesResponseSchema, type GetTemplatesResponse } from "@/schemas/entities/templates/handlers/get-templates/response";
import { createHonoApp } from "@/utils/create-hono-app";

export const getTemplatesRoute = createHonoApp().basePath("/templates");

// GET /api/v1/templates
getTemplatesRoute.get("/", sessionMiddleware, async (c) => {
  const foundTemplates = await db.query.template.findMany();

  return c.json<GetTemplatesResponse>(
    getTemplatesResponseSchema.parse({
      data: foundTemplates
    }),
  );
});
