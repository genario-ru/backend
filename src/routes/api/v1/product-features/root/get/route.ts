import { db } from "@/db";
import {
  type GetProductFeaturesResponse,
  getProductFeaturesResponseSchema,
} from "@/domains/product-features/schemas/handlers/get-product-features/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getProductFeaturesRoute =
  createHonoApp().basePath("/product-features");

// GET /api/v1/product-features
getProductFeaturesRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-product-features",
    windowMs: 1000,
    limit: 5,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.ProductFeatures],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Product features retrieved successfully",
        schema: getProductFeaturesResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundProductFeatures = await db.query.productFeature.findMany({
      orderBy: (productFeature, { asc, desc }) => [
        desc(productFeature.priority),
        asc(productFeature.name),
      ],
    });

    return c.json<GetProductFeaturesResponse>(
      getProductFeaturesResponseSchema.parse({
        data: foundProductFeatures,
      }),
    );
  },
);
