import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import {
  type GetCreditsPackagesResponse,
  getCreditsPackagesResponseSchema,
} from "@/schemas/entities/credits/handlers/get-credits-packages/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const getCreditsPackagesRoute =
  createHonoApp().basePath("/credits/packages");

// GET /api/v1/credits/packages
getCreditsPackagesRoute.get(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "get-credits-packages",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Credits],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Credits packages retrieved successfully",
        schema: getCreditsPackagesResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundCreditsPackages = await db.query.creditsPackage.findMany();

    return c.json<GetCreditsPackagesResponse>(
      getCreditsPackagesResponseSchema.parse({
        data: foundCreditsPackages,
      }),
    );
  },
);
