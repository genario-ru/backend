import { db } from "@/db";
import { createHonoApp } from "@/utils/create-hono-app";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { getProfileParamsSchema } from "@/schemas/entities/profiles/handlers/get-profile/params";
import { throwAPIError } from "@/utils/throw-api-error";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getProfileResponseSchema, type GetProfileResponse } from "@/schemas/entities/profiles/handlers/get-profile/response";

export const getProfileRoute = createHonoApp().basePath("/profiles/:profileId");

// GET /api/v1/profiles/{profileId}
getProfileRoute.get("/", sessionMiddleware, async (c) => {
  const { profileId } = getProfileParamsSchema.parse(c.req.param());
  const user = c.get("user");

  const foundProfile = await db.query.profile.findFirst({
    where: (profile, { eq, and }) => {
      return and(
        eq(profile.id, profileId),
        eq(profile.userId, user.id),
      );
    },
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

  if (!foundProfile) {
    return throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Данный профиль не существует или у вас нет возможности просматривать его",
    });
  }

  const { profileToPlatform, profileToTone, ...profile } = foundProfile;

  return c.json<GetProfileResponse>(
    getProfileResponseSchema.parse({
      data: {
        ...profile,
        platforms: profileToPlatform.map(({ platform }) => platform),
        tones: profileToTone.map(({ tone }) => tone),
      },
    }),
  );
});
