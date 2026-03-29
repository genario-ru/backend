import { eq } from "drizzle-orm";
import { isNull } from "es-toolkit";
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
import { createProfileBodySchema } from "@/schemas/entities/profiles/handlers/create-profile/body";
import {
  type CreateProfileResponse,
  createProfileResponseSchema,
} from "@/schemas/entities/profiles/handlers/create-profile/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const createProfileRoute = createHonoApp().basePath("/profiles");

// POST /api/v1/profiles
createProfileRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "create-profile",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Profile created successfully",
        schema: createProfileResponseSchema,
      }),
    },
  }),
  validator("json", createProfileBodySchema),
  async (c) => {
    const { platformIds, toneIds, ...createProfileParams } =
      c.req.valid("json");

    const user = c.get("user");
    const tariff = c.get("tariff");

    if (!isNull(tariff.maxProfilesAmount)) {
      const userProfiles = await db.query.profile.findMany({
        where: (profile) => eq(profile.userId, user.id),
      });

      if (userProfiles.length >= tariff.maxProfilesAmount) {
        return throwAPIError({
          code: APIErrorCode.Forbidden,
          message:
            "Вы достигли максимального количества профилей по тарифу вашей подписки",
        });
      }
    }

    const createdProfile = await db.transaction(async (tx) => {
      const [createdProfile] = await tx
        .insert(profile)
        .values({
          userId: user.id,
          ...createProfileParams,
        })
        .returning();

      const createLinkingTablePromises: Promise<any>[] = [];

      if (platformIds && platformIds.length > 0) {
        createLinkingTablePromises.push(
          tx.insert(profileToPlatform).values(
            platformIds.map((platformId) => ({
              profileId: createdProfile.id,
              platformId,
            })),
          ),
        );
      }

      if (toneIds && toneIds.length > 0) {
        createLinkingTablePromises.push(
          tx.insert(profileToTone).values(
            toneIds.map((toneId) => ({
              profileId: createdProfile.id,
              toneId,
            })),
          ),
        );
      }

      await Promise.all(createLinkingTablePromises);

      return createdProfile;
    });

    return c.json<CreateProfileResponse>(
      createProfileResponseSchema.parse({
        data: createdProfile,
      }),
      HTTPStatusCode.Created,
    );
  },
);
