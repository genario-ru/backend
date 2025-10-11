import { db } from "@/db";
import { createHonoApp } from "@/utils/create-hono-app";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { getMyProfilesResponseSchema, type GetMyProfilesResponse } from "@/schemas/entities/profiles/handlers/get-my-profiles/response";

export const getMyProfilesRoute = createHonoApp().basePath("/profiles/my");

// GET /api/v1/profiles/my
getMyProfilesRoute.get("/", sessionMiddleware, async (c) => {
  const user = c.get("user");

  const foundProfiles = await db.query.profile.findMany({
    where: (profile, { eq }) => eq(profile.userId, user.id),
    with: {
      user: true,
      type: true,
      profileToPlatform: {
        with: { platform: true },
      },
      profileToTone: {
        with: { tone: true },
      },
    },
  });

  return c.json<GetMyProfilesResponse>(
    getMyProfilesResponseSchema.parse({
      data: foundProfiles.map((profile) => ({
        ...profile,
        platforms: profile.profileToPlatform.map(({ platform }) => platform),
        tones: profile.profileToTone.map(({ tone }) => tone),
      })),
    }),
  );
});
