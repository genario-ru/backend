import { and, eq, inArray } from "drizzle-orm";
import { difference } from "es-toolkit";

import { db } from "@/db";
import { profile, profileToPlatform, profileToTone } from "@/db/schema";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { updateProfileBodySchema } from "@/schemas/entities/profiles/handlers/update-profile/body";
import { updateProfileParamsSchema } from "@/schemas/entities/profiles/handlers/update-profile/params";
import {
  type UpdateProfileResponse,
  updateProfileResponseSchema,
} from "@/schemas/entities/profiles/handlers/update-profile/response";
import { createHonoApp } from "@/utils/create-hono-app";
import { throwAPIError } from "@/utils/throw-api-error";

export const updateProfileRoute = createHonoApp().basePath(
  "/profiles/:profileId",
);

// PATCH /api/v1/profiles/{profileId}
updateProfileRoute.patch("/", sessionMiddleware, async (c) => {
  const { profileId } = updateProfileParamsSchema.parse(c.req.param());

  const {
    platformIds: newPlatformIds,
    toneIds: newToneIds,
    ...updateProfileParams
  } = updateProfileBodySchema.parse(c.req.json());

  const user = c.get("user");

  const foundProfile = await db.query.profile.findFirst({
    where: (profile, { eq, and }) => {
      return and(eq(profile.id, profileId), eq(profile.userId, user.id));
    },
    with: {
      profileToPlatform: true,
      profileToTone: true,
    },
  });

  if (!foundProfile) {
    return throwAPIError({
      code: APIErrorCode.NotFound,
      message:
        "Данный профиль не существует или у вас нет возможности редактировать его",
    });
  }

  const updatedProfile = await db.transaction(async (tx) => {
    const updateLinkingTablePromises: Promise<any>[] = [];

    // Добавляем и удаляем платформы, связанные с профилем
    if (newPlatformIds) {
      const oldPlatformIds = foundProfile.profileToPlatform.map(
        ({ platformId }) => platformId,
      );

      const createPlatformIds = difference(newPlatformIds, oldPlatformIds);
      const deletePlatformIds = difference(oldPlatformIds, newPlatformIds);

      if (createPlatformIds.length > 0) {
        updateLinkingTablePromises.push(
          tx.insert(profileToPlatform).values(
            createPlatformIds.map((platformId) => ({
              profileId,
              platformId,
            })),
          ),
        );
      }

      if (deletePlatformIds.length > 0) {
        updateLinkingTablePromises.push(
          tx
            .delete(profileToPlatform)
            .where(
              and(
                eq(profileToPlatform.profileId, profileId),
                inArray(profileToPlatform.platformId, deletePlatformIds),
              ),
            ),
        );
      }
    }

    // Добавляем и удаляем тона, связанные с профилем
    if (newToneIds) {
      const oldToneIds = foundProfile.profileToTone.map(({ toneId }) => toneId);

      const createToneIds = difference(newToneIds, oldToneIds);
      const deleteToneIds = difference(oldToneIds, newToneIds);

      if (createToneIds.length > 0) {
        updateLinkingTablePromises.push(
          tx.insert(profileToTone).values(
            createToneIds.map((toneId) => ({
              profileId,
              toneId,
            })),
          ),
        );
      }

      if (deleteToneIds.length > 0) {
        updateLinkingTablePromises.push(
          tx
            .delete(profileToTone)
            .where(
              and(
                eq(profileToTone.profileId, profileId),
                inArray(profileToTone.toneId, deleteToneIds),
              ),
            ),
        );
      }
    }

    const [[updatedProfile]] = await Promise.all([
      tx
        .update(profile)
        .set(updateProfileParams)
        .where(and(eq(profile.id, profileId), eq(profile.userId, user.id)))
        .returning(),
      ...updateLinkingTablePromises,
    ]);

    return updatedProfile;
  });

  return c.json<UpdateProfileResponse>(
    updateProfileResponseSchema.parse({
      data: updatedProfile,
    }),
  );
});
