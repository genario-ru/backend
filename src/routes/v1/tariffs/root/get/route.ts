import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import {
  type GetTariffsResponse,
  getTariffsResponseSchema,
} from "@/schemas/entities/tariffs/handlers/get-tariffs/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";

export const getTariffsRoute = createHonoApp().basePath("/tariffs");

// GET /api/v1/tariffs
getTariffsRoute.get(
  "/",
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
      where: (tariff, { eq }) => eq(tariff.isRenewable, true),
    });

    return c.json<GetTariffsResponse>(
      getTariffsResponseSchema.parse({
        data: foundTariffs,
      }),
    );
  },
);
