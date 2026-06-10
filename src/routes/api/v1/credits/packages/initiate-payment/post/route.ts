import { validator } from "hono-openapi";

import { getActivePaymentMethod } from "@/domains/billing/services/get-active-payment-method";
import { initiateCreditsPackageRecurringPayment } from "@/domains/billing/services/initiate-credits-package-recurring-payment";
import { initiateCreditsPackageRedirectPayment } from "@/domains/billing/services/initiate-credits-package-redirect-payment";
import { initiateCreditsPackagePaymentBodySchema } from "@/domains/credits/schemas/handlers/initiate-credits-package-payment/body";
import {
  type InitiateCreditsPackagePaymentResponse,
  initiateCreditsPackagePaymentResponseSchema,
} from "@/domains/credits/schemas/handlers/initiate-credits-package-payment/response";
import { getCreditsPackageForPurchase } from "@/domains/credits/services/get-credits-package-for-purchase";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { subscriptionMiddleware } from "@/middleware/subscription-middleware";
import { HTTPStatusCode } from "@/shared/constants/common/http-status-code";
import { OpenAPITags } from "@/shared/constants/openapi/tags";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { createOpenAPIResponse } from "@/shared/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/shared/utils/server/create-hono-app";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

export const initiateCreditsPackagePaymentRoute = createHonoApp().basePath(
  "/credits/packages/initiate-payment",
);

// POST /api/v1/credits/packages/initiate-payment
initiateCreditsPackagePaymentRoute.post(
  "/",
  rateLimitMiddleware({
    keyPrefix: "initiate-credits-package-payment-burst",
    windowMs: 3 * 1000,
    limit: 1,
  }),
  rateLimitMiddleware({
    keyPrefix: "initiate-credits-package-payment",
    windowMs: 60 * 1000,
    limit: 10,
  }),
  sessionMiddleware,
  subscriptionMiddleware,
  openAPIResponseMiddleware({
    tags: [OpenAPITags.Credits],
    responses: {
      [HTTPStatusCode.Ok]: createOpenAPIResponse({
        description: "Credits package payment initiated successfully",
        schema: initiateCreditsPackagePaymentResponseSchema,
      }),
    },
  }),
  validator("json", initiateCreditsPackagePaymentBodySchema),
  async (c) => {
    const user = c.get("user");
    const {
      creditsPackageSlug,
      redirect: redirectPath,
      paymentMethodId,
    } = c.req.valid("json");

    const foundCreditsPackage = await getCreditsPackageForPurchase({
      creditsPackageSlug,
    });

    if (!foundCreditsPackage) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Указанный пакет кредитов не существует или недоступен для покупки",
      });
    }

    if (paymentMethodId) {
      // Оплата сохраненным способом: списываем деньги рекуррентным платежом
      // без редиректа в ЮKassa.
      const foundPaymentMethod = await getActivePaymentMethod({
        userId: user.id,
        paymentMethodId,
      });

      if (!foundPaymentMethod) {
        return throwAPIError({
          code: APIErrorCode.NotFound,
          message: "Указанный способ оплаты не найден или недоступен",
        });
      }

      const createdPayment = await initiateCreditsPackageRecurringPayment({
        userId: user.id,
        userEmail: user.email,
        creditsPackage: foundCreditsPackage,
        paymentMethod: foundPaymentMethod,
      });

      return c.json<InitiateCreditsPackagePaymentResponse>(
        initiateCreditsPackagePaymentResponseSchema.parse({
          data: createdPayment,
        }),
      );
    }

    const createdPayment = await initiateCreditsPackageRedirectPayment({
      userId: user.id,
      userEmail: user.email,
      creditsPackage: foundCreditsPackage,
      creditsPackageSlug,
      redirectPath,
    });

    return c.json<InitiateCreditsPackagePaymentResponse>(
      initiateCreditsPackagePaymentResponseSchema.parse({
        data: createdPayment,
      }),
    );
  },
);
