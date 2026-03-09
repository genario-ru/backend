import { validator } from "hono-openapi";

import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { getPaymentInfoQuerySchema } from "@/schemas/entities/billing/handlers/get-payment-info/query";
import {
  type GetPaymentInfoResponse,
  getPaymentInfoResponseSchema,
} from "@/schemas/entities/billing/handlers/get-payment-info/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const getPaymentInfo = createHonoApp().basePath("/billing/payment-info");

// GET /api/v1/billing/payment-info
getPaymentInfo.get(
  "/",
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Billing],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Payment info retrieved successfully",
        schema: getPaymentInfoResponseSchema,
      }),
    },
  }),
  validator("query", getPaymentInfoQuerySchema),
  async (c) => {
    const {
      tariffSlug,
      trialTariffSlug,
      redirect: redirectPath,
    } = c.req.valid("query");

    const foundTariff = await db.query.tariff.findFirst({
      where: (tariff, { eq }) => eq(tariff.slug, tariffSlug),
    });

    if (!foundTariff) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Указанный тариф не существует",
      });
    }

    if (trialTariffSlug) {
      const foundTrialTariff = await db.query.tariff.findFirst({
        where: (tariff, { and, eq }) =>
          and(eq(tariff.slug, trialTariffSlug), eq(tariff.isRenewable, false)),
      });

      if (!foundTrialTariff) {
        return throwAPIError({
          code: APIErrorCode.NotFound,
          message: "Указанный тариф пробного периода не существует",
        });
      }
    }

    return c.json<GetPaymentInfoResponse>(
      getPaymentInfoResponseSchema.parse({
        data: {
          paymentLink: "",
        },
      }),
    );
  },
);
