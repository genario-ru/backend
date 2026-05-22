import { db } from "@/db";
import {
  type GetCreditsPackagesResponse,
  getCreditsPackagesResponseSchema,
} from "@/domains/credits/schemas/handlers/get-credits-packages/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getCreditsPackagesRoute =
  createHonoApp().basePath("/credits/packages");

// GET /api/v1/credits/packages
getCreditsPackagesRoute.get(
  "/",
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
      orderBy: (creditsPackage, { asc }) => asc(creditsPackage.price),
      where: (creditsPackage, { eq }) => eq(creditsPackage.forPurchase, true),
    });

    return c.json<GetCreditsPackagesResponse>(
      getCreditsPackagesResponseSchema.parse({
        data: foundCreditsPackages,
      }),
    );
  },
);
