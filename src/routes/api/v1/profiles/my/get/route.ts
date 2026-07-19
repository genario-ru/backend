import { db } from "@/db";
import {
  type GetMyProfilesResponse,
  getMyProfilesResponseSchema,
} from "@/domains/profiles/schemas/handlers/get-my-profiles/response";
import { prepareProfileExtended } from "@/domains/profiles/utils/prepare-profile-extended";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getMyProfilesRoute = createHonoApp().basePath("/profiles/my");

// GET /api/v1/profiles/my
getMyProfilesRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-my-profiles",
    windowMs: 1000,
    limit: 2,
  }),
  sessionMiddleware,
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
      orderBy: (profile, { desc }) => [desc(profile.createdAt)],
      where: (profile, { eq }) => eq(profile.userId, user.id),
      with: {
        type: true,
        profileToPlatform: {
          with: { platform: true },
        },
      },
    });

    return c.json<GetMyProfilesResponse>(
      getMyProfilesResponseSchema.parse({
        data: foundProfiles.map(prepareProfileExtended),
      }),
    );
  },
);
