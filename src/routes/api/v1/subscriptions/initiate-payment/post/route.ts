import { validator } from "hono-openapi";

import { db } from "@/db";
import { createSubscription } from "@/domains/billing/services/create-subscription";
import { initiateSubscriptionPaymentBodySchema } from "@/domains/subscriptions/schemas/handlers/initiate-subscriptions-payment/body";
import {
  type InitiateSubscriptionPaymentResponse,
  initiateSubscriptionPaymentResponseSchema,
} from "@/domains/subscriptions/schemas/handlers/initiate-subscriptions-payment/response";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const initiateSubscriptionPaymentRoute = createHonoApp().basePath(
  "/subscriptions/initiate-payment",
);

// POST /api/v1/subscriptions/initiate-payment
initiateSubscriptionPaymentRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "initiate-subscription-payment",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  sessionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Subscriptions],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Subscription payment initiated successfully",
        schema: initiateSubscriptionPaymentResponseSchema,
      }),
    },
  }),
  validator("json", initiateSubscriptionPaymentBodySchema),
  async (c) => {
    const user = c.get("user");

    const {
      tariffSlug,
      trialTariffSlug,
      redirect: redirectPath,
    } = c.req.valid("json");

    const foundTariff = await db.query.tariff.findFirst({
      where: (tariff, { eq }) => eq(tariff.slug, tariffSlug),
    });

    if (!foundTariff) {
      throw throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Указанный тариф не существует",
      });
    }

    let tariffId: string = foundTariff.id;
    let nextTariffId: string | undefined;

    if (trialTariffSlug) {
      const foundTrialTariff = await db.query.tariff.findFirst({
        where: (tariff, { and, eq }) =>
          and(eq(tariff.slug, trialTariffSlug), eq(tariff.isRenewable, false)),
      });

      if (!foundTrialTariff) {
        throw throwAPIError({
          code: APIErrorCode.NotFound,
          message: "Указанный тариф пробного периода не существует",
        });
      }

      tariffId = foundTrialTariff.id;
      nextTariffId = foundTariff.id;
    }

    const { createdPayment } = await createSubscription({
      userId: user.id,
      tariffId,
      nextTariffId,
      redirectPath,
    });

    if (!createdPayment?.paymentLink) {
      throw throwAPIError({
        code: APIErrorCode.InternalServerError,
        message: "Произошла ошибка при создании платежа для подписки",
      });
    }

    return c.json<InitiateSubscriptionPaymentResponse>(
      initiateSubscriptionPaymentResponseSchema.parse({
        data: createdPayment,
      }),
    );
  },
);
