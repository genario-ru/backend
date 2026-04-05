import { db } from "@/db";
import {
  type GetTrialTariffResponse,
  getTrialTariffResponseSchema,
} from "@/domains/tariffs/schemas/handlers/get-trial-tariff/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

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
