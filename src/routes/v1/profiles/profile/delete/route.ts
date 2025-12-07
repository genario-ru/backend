import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { profile } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { deleteProfileParamsSchema } from "@/schemas/entities/profiles/handlers/delete-profile/params";
import {
  type DeleteProfileResponse,
  deleteProfileResponseSchema,
} from "@/schemas/entities/profiles/handlers/delete-profile/response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const deleteProfileRoute = createHonoApp().basePath(
  "/profiles/:profileId",
);

// DELETE /api/v1/profiles/{profileId}
deleteProfileRoute.delete(
  "/",
  sessionMiddleware,
  zValidator("param", deleteProfileParamsSchema),
  async (c) => {
    const { profileId } = c.req.valid("param");
    const user = c.get("user");

    const [deletedProfile] = await db
      .delete(profile)
      .where(and(eq(profile.id, profileId), eq(profile.userId, user.id)))
      .returning();

    return c.json<DeleteProfileResponse>(
      deleteProfileResponseSchema.parse({
        data: deletedProfile,
      }),
    );
  },
);
