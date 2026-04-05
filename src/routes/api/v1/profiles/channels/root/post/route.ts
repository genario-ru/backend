import { eq } from "drizzle-orm";
import { isNull } from "es-toolkit";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { profilesFromChannelsJob } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { enqueueProfilesFromChannelsGeneration } from "@/mq/profiles-from-channels-generation/queue";
import { createProfilesFromChannelsBodySchema } from "@/schemas/entities/profiles/handlers/create-profiles-from-channels/body";
import {
  type CreateProfilesFromChannelsError,
  createProfilesFromChannelsErrorSchema,
} from "@/schemas/entities/profiles/handlers/create-profiles-from-channels/error";
import {
  type CreateProfilesFromChannelsResponse,
  createProfilesFromChannelsResponseSchema,
} from "@/schemas/entities/profiles/handlers/create-profiles-from-channels/response";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

import { validateProfileChannel } from "../../utils";

export const createProfilesFromChannelsRoute =
  createHonoApp().basePath("/profiles/channels");

// POST /api/v1/profiles/channels
createProfilesFromChannelsRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "create-profiles-from-channels",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Created]: createOpenAPIResponse({
        description: "Profiles from channels created successfully",
        schema: createProfilesFromChannelsResponseSchema,
      }),
      [HTTPStatusCode.BadRequest]: createOpenAPIResponse({
        description: "Profiles from channels creation failed",
        schema: createProfilesFromChannelsErrorSchema,
      }),
    },
  }),
  validator("json", createProfilesFromChannelsBodySchema),
  async (c) => {
    const { channelUrls } = c.req.valid("json");

    const validationResults = await Promise.all(
      channelUrls.map((channelUrl) => validateProfileChannel(channelUrl)),
    );

    const errorValidationResults = validationResults.filter(
      (result) => result.status === "error",
    );

    if (errorValidationResults.length > 0) {
      return c.json<CreateProfilesFromChannelsError>(
        createProfilesFromChannelsErrorSchema.parse({
          data: validationResults,
        }),
        HTTPStatusCode.BadRequest,
      );
    }

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

    const [job] = await db
      .insert(profilesFromChannelsJob)
      .values({ userId: user.id, status: "pending" })
      .returning();

    const successValidationResults = validationResults.filter(
      (result) => result.status === "success",
    );

    await enqueueProfilesFromChannelsGeneration({
      jobId: job.id,
      userId: user.id,
      channels: successValidationResults.map((result) => ({
        url: result.url,
        platformId: result.platform.id,
        platformSlug: result.platform.slug,
      })),
    });

    return c.json<CreateProfilesFromChannelsResponse>(
      createProfilesFromChannelsResponseSchema.parse({
        data: job,
      }),
      HTTPStatusCode.Created,
    );
  },
);
