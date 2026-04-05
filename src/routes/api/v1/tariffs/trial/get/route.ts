import { HTTPStatusCode } from "@/constants/shared/common/http-status-code";
import { OpenAPITags } from "@/constants/shared/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import {
  type GetTrialTariffResponse,
  getTrialTariffResponseSchema,
} from "@/schemas/entities/tariffs/handlers/get-trial-tariff/response";
import { APIErrorCode } from "@/schemas/shared/common/api-error";
import { createOpenAPIResponse } from "@/utils/shared/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/shared/server/create-hono-app";
import { throwAPIError } from "@/utils/shared/server/throw-api-error";

import { prepareTariffFeatures } from "../../utils";

export const getTrialTariffRoute = createHonoApp().basePath("/tariffs/trial");

// GET /api/v1/tariffs/trial
getTrialTariffRoute.get(
  "/",
  rateLimitMiddleware({
    keyPrefix: "get-trial-tariff",
    windowMs: 60 * 1000,
    limit: 10,
  }),
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
      with: {
        creditsPackage: true,
      },
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
