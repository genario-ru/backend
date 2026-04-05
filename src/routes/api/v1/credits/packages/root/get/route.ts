import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import {
  type GetCreditsPackagesResponse,
  getCreditsPackagesResponseSchema,
} from "@/domains/credits/schemas/handlers/get-credits-packages/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";

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
  subscriptionMiddleware,
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
    const foundCreditsPackages = await db.query.creditsPackage.findMany({
      where: (creditsPackage, { eq }) => eq(creditsPackage.forPurchase, true),
    });

    return c.json<GetCreditsPackagesResponse>(
      getCreditsPackagesResponseSchema.parse({
        data: foundCreditsPackages,
      }),
    );
  },
);
