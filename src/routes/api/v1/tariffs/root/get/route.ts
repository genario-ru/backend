import { db } from "@/db";
import {
  type GetTariffsResponse,
  getTariffsResponseSchema,
} from "@/domains/tariffs/schemas/handlers/get-tariffs/response";
import { prepareTariffFeatures } from "@/domains/tariffs/utils/prepare-tariff-features";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";

export const getTariffsRoute = createHonoApp().basePath("/tariffs");

// GET /api/v1/tariffs
getTariffsRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-tariffs",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Tariffs],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Tariffs retrieved successfully",
        schema: getTariffsResponseSchema,
      }),
    },
  }),
  async (c) => {
    const foundTariffs = await db.query.tariff.findMany({
      orderBy: (tariff, { asc }) => asc(tariff.price),
      where: (tariff, { eq }) => eq(tariff.isRenewable, true),
      with: {
        creditsPackage: true,
      },
    });

    return c.json<GetTariffsResponse>(
      getTariffsResponseSchema.parse({
        data: foundTariffs.map((tariff) => ({
          ...tariff,
          features: prepareTariffFeatures(tariff),
        })),
      }),
    );
  },
);
