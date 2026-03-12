import { and, eq, inArray } from "drizzle-orm";
import { difference } from "es-toolkit";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { profile, profileToPlatform, profileToTone } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { updateProfileBodySchema } from "@/schemas/entities/profiles/handlers/update-profile/body";
import { updateProfileParamsSchema } from "@/schemas/entities/profiles/handlers/update-profile/params";
import {
  type UpdateProfileResponse,
  updateProfileResponseSchema,
} from "@/schemas/entities/profiles/handlers/update-profile/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const updateProfileRoute = createHonoApp().basePath(
  "/profiles/:profileId",
);

// PATCH /api/v1/profiles/{profileId}
updateProfileRoute.patch(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "update-profile",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Profile updated successfully",
        schema: updateProfileResponseSchema,
      }),
    },
  }),
  validator("param", updateProfileParamsSchema),
  validator("json", updateProfileBodySchema),
  async (c) => {
    const { profileId } = c.req.valid("param");

    const {
      platformIds: newPlatformIds,
      toneIds: newToneIds,
      ...updateProfileParams
    } = c.req.valid("json");

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
        const oldToneIds = foundProfile.profileToTone.map(
          ({ toneId }) => toneId,
        );

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
  },
);
