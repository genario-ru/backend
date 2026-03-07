import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import {
  type GetTrialTariffResponse,
  getTrialTariffResponseSchema,
} from "@/schemas/entities/tariffs/handlers/get-trial-tariff/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

import { prepareTariffFeatures } from "../../utils";

export const getTrialTariffRoute = createHonoApp().basePath("/tariffs/trial");

// GET /api/v1/tariffs/trial
getTrialTariffRoute.get(
  "/",
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Tariffs],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Trial tariff retrieved successfully",
        schema: getTrialTariffResponseSchema,
      }),
    },
  }),
  async (c) => {
    const lastUpdatedTrialTariff = await db.query.tariff.findFirst({
      orderBy: (tariff, { desc }) => [desc(tariff.updatedAt)],
      where: (tariff, { eq }) => eq(tariff.isRenewable, false),
    });

    if (!lastUpdatedTrialTariff) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        details: "Trial tariff was not found",
      });
    }

    return c.json<GetTrialTariffResponse>(
      getTrialTariffResponseSchema.parse({
        data: {
          ...lastUpdatedTrialTariff,
          features: prepareTariffFeatures(lastUpdatedTrialTariff),
        },
      }),
    );
  },
);
