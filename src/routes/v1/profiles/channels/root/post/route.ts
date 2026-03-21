import { eq } from "drizzle-orm";
import { isNull } from "es-toolkit";
import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { createProfilesFromChannelsBodySchema } from "@/schemas/entities/profiles/handlers/create-profiles-from-channels/body";
import {
  type CreateProfilesFromChannelsError,
  createProfilesFromChannelsErrorSchema,
} from "@/schemas/entities/profiles/handlers/create-profiles-from-channels/error";
import {
  type CreateProfilesFromChannelsResponse,
  createProfilesFromChannelsResponseSchema,
} from "@/schemas/entities/profiles/handlers/create-profiles-from-channels/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

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
        schema: createProfilesFromChannelsBodySchema,
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

    if (validationResults.some((result) => result.status === "error")) {
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

    // TODO: Добавить создание профилей из каналов

    return c.json<CreateProfilesFromChannelsResponse>(
      createProfilesFromChannelsResponseSchema.parse({
        data: null,
      }),
      HTTPStatusCode.Created,
    );
  },
);
