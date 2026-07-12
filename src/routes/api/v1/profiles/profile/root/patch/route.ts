import { and, eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { profile, profileToPlatform } from "@/db/schema";
import { updateProfileBodySchema } from "@/domains/profiles/schemas/handlers/update-profile/body";
import { updateProfileParamsSchema } from "@/domains/profiles/schemas/handlers/update-profile/params";
import {
  type UpdateProfileResponse,
  updateProfileResponseSchema,
} from "@/domains/profiles/schemas/handlers/update-profile/response";
import { prepareProfileExtended } from "@/domains/profiles/utils/prepare-profile-extended";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const updateProfileRoute = createHonoApp().basePath(
  "/profiles/:profileId",
);

// PATCH /api/v1/profiles/{profileId}
updateProfileRoute.patch(
  "/",
  rateLimitMiddleware({
    keyPrefix: "update-profile",
    windowMs: 3 * 1000,
    limit: 1,
  }),
  sessionMiddleware,
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
    const { platformIds, ...updateProfileParams } = c.req.valid("json");
    const user = c.get("user");

    const foundProfile = await db.query.profile.findFirst({
      where: (profile, { eq, and }) => {
        return and(eq(profile.id, profileId), eq(profile.userId, user.id));
      },
    });

    if (!foundProfile) {
      throw throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Данный профиль не существует или у вас нет возможности редактировать его",
      });
    }

    await db.transaction(async (tx) => {
      const txOperations: Promise<unknown>[] = [];

      if (platformIds) {
        txOperations.push(
          tx
            .delete(profileToPlatform)
            .where(eq(profileToPlatform.profileId, profileId)),
        );

        if (platformIds.length > 0) {
          txOperations.push(
            tx.insert(profileToPlatform).values(
              platformIds.map((platformId) => ({
                profileId,
                platformId,
              })),
            ),
          );
        }
      }

      if (Object.keys(updateProfileParams).length > 0) {
        txOperations.push(
          tx
            .update(profile)
            .set(updateProfileParams)
            .where(and(eq(profile.id, profileId), eq(profile.userId, user.id))),
        );
      }

      await Promise.all(txOperations);
    });

    const updatedProfile = await db.query.profile.findFirst({
      where: (profile, { and, eq }) =>
        and(eq(profile.id, profileId), eq(profile.userId, user.id)),
      with: {
        type: true,
        profileToPlatform: {
          with: {
            platform: true,
          },
        },
      },
    });

    if (!updatedProfile) {
      throw throwAPIError({
        code: APIErrorCode.InternalServerError,
        message: "Не удалось загрузить обновленный профиль",
      });
    }

    return c.json<UpdateProfileResponse>(
      updateProfileResponseSchema.parse({
        data: prepareProfileExtended(updatedProfile),
      }),
    );
  },
);
