import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import {
  type GetMyProfilesResponse,
  getMyProfilesResponseSchema,
} from "@/domains/profiles/schemas/handlers/get-my-profiles/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

export const getMyProfilesRoute = createHonoApp().basePath("/profiles/my");

// GET /api/v1/profiles/my
getMyProfilesRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-my-profiles",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "My profiles retrieved successfully",
        schema: getMyProfilesResponseSchema,
      }),
    },
  }),
  async (c) => {
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
  },
);
