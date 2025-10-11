import { createHonoApp } from "@/utils/create-hono-app";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { deleteProfileParamsSchema } from "@/schemas/entities/profiles/handlers/delete-profile/params";
import { db } from "@/db";
import { profile } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { deleteProfileResponseSchema, type DeleteProfileResponse } from "@/schemas/entities/profiles/handlers/delete-profile/response";

export const deleteProfileRoute = createHonoApp().basePath("/profiles/:profileId");

// DELETE /api/v1/profiles/{profileId}
deleteProfileRoute.delete("/", sessionMiddleware, async (c) => {
  const { profileId } = deleteProfileParamsSchema.parse(c.req.param());
  const user = c.get("user");

  const [deletedProfile] = await db
    .delete(profile)
    .where(
      and(
        eq(profile.id, profileId),
        eq(profile.userId, user.id),
      ),
    )
    .returning();

  return c.json<DeleteProfileResponse>(
    deleteProfileResponseSchema.parse({
      data: deletedProfile,
    }),
  );
});