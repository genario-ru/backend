import { db } from "@/db";
import { sessionMiddleware } from "@/middleware/session-middleware";
import {
  type GetProfileTypesResponse,
  getProfileTypesResponseSchema,
} from "@/schemas/entities/profiles/handlers/get-profile-types/response";
import { createHonoApp } from "@/utils/create-hono-app";

export const getProfileTypesRoute = createHonoApp().basePath("/profiles/types");

// GET /api/v1/profiles/types
getProfileTypesRoute.get("/", sessionMiddleware, async (c) => {
  const foundProfileTypes = await db.query.profileType.findMany();

  return c.json<GetProfileTypesResponse>(
    getProfileTypesResponseSchema.parse({
      data: foundProfileTypes,
    }),
  );
});
