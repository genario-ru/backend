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
    const [foundTariffs, foundTariffTrials] = await Promise.all([
      db.query.tariff.findMany(),
      db.query.tariffTrial.findMany(),
    ]);

    const preparedTariffs = foundTariffs.map((tariff) => ({
      ...tariff,
      trial: foundTariffTrials.find(
        (tariffTrial) => tariffTrial.tariffId === tariff.id,
      ),
    }));

    return c.json<GetTariffsResponse>(
      getTariffsResponseSchema.parse({
        data: preparedTariffs,
      }),
    );
  },
);
