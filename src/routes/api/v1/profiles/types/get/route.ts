import { db } from "@/db";
import {
  type GetProfileTypesResponse,
  getProfileTypesResponseSchema,
} from "@/domains/profiles/schemas/handlers/get-profile-types/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getProfileTypesRoute = createHonoApp().basePath("/profiles/types");

// GET /api/v1/profiles/types
getProfileTypesRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-profile-types",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Profiles],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Profile types retrieved successfully",
        schema: getProfileTypesResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundProfileTypes = await db.query.profileType.findMany({
      orderBy: (profileType, { asc, desc }) => [
        desc(profileType.priority),
        asc(profileType.name),
      ],
    });

    return c.json<GetProfileTypesResponse>(
      getProfileTypesResponseSchema.parse({
        data: foundProfileTypes,
      }),
    );
  },
);
