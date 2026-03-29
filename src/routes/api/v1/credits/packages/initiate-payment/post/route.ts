import { randomUUID } from "crypto";
import { validator } from "hono-openapi";

import { postPayments } from "@/codegen/api/yookassa";
import { envs } from "@/constants/common/envs";
import { HTTPStatusCode } from "@/constants/common/http-status-code";
import { OpenAPITags } from "@/constants/openapi/tags";
import { db } from "@/db";
import { creditsPackageToPayment, payment } from "@/db/schema";
import { openAPIResponseMiddleware } from "@/middleware/openapi-response-middleware";
import { rateLimitMiddleware } from "@/middleware/rate-limit-middleware";
import { sessionMiddleware } from "@/middleware/session-middleware";
import { APIErrorCode } from "@/schemas/common/api-error";
import { initiateCreditsPackagePaymentBodySchema } from "@/schemas/entities/credits/handlers/initiate-credits-package-payment/body";
import {
  type InitiateCreditsPackagePaymentResponse,
  initiateCreditsPackagePaymentResponseSchema,
} from "@/schemas/entities/credits/handlers/initiate-credits-package-payment/response";
import { createOpenAPIResponse } from "@/utils/openapi/create-openapi-response";
import { createHonoApp } from "@/utils/server/create-hono-app";
import { throwAPIError } from "@/utils/server/throw-api-error";

export const initiateCreditsPackagePaymentRoute = createHonoApp().basePath(
  "/credits/packages/initiate-payment",
);

// POST /api/v1/credits/packages/initiate-payment
initiateCreditsPackagePaymentRoute.post(
  "/",
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "initiate-credits-package-payment",
    windowMs: 60 * 1000,
    limit: 10,
  }),
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

    const { creditsPackageId, redirect: redirectPath } = c.req.valid("json");

    const foundCreditsPackage = await db.query.creditsPackage.findFirst({
      where: (creditsPackage, { eq, and }) =>
        and(
          eq(creditsPackage.id, creditsPackageId),
          eq(creditsPackage.forPurchase, true),
        ),
    });

    if (!foundCreditsPackage) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message:
          "Указанный пакет кредитов не существует или недоступен для покупки",
      });
    }

    const lastPendingPayment = await db.query.payment.findFirst({
      where: (payment, { and, eq }) =>
        and(eq(payment.status, "pending"), eq(payment.userId, user.id)),
      orderBy: (payment, { desc }) => desc(payment.createdAt),
      with: {
        creditsPackageToPayment: {
          where: (creditsPackageToPayment, { eq }) =>
            eq(creditsPackageToPayment.creditsPackageId, creditsPackageId),
        },
      },
    });

    const idempotenceKey = lastPendingPayment?.id ?? randomUUID();

    const returnUrl = redirectPath
      ? `${envs.FRONTEND_BASE_URL}${redirectPath}`
      : `${envs.FRONTEND_BASE_URL}/billing`;

    const amountValue = foundCreditsPackage.price;
    const description = `Оплата пакета кредитов "${foundCreditsPackage.name}" для ${user.email}`;
    const receiptItemDescription = `Пакет кредитов "${foundCreditsPackage.name}" в сервисе ${envs.FRONTEND_BASE_URL}`;

    // Отправляем запрос к API ЮKassa

    const createdYooKassaPayment = await postPayments({
      data: {
        amount: {
          value: amountValue.toString(),
          currency: "RUB",
        },
        description,
        receipt: {
          customer: {
            email: user.email,
          },
          items: [
            {
              description: receiptItemDescription,
              amount: {
                value: amountValue.toString(),
                currency: "RUB",
              },
              vat_code: 1,
              quantity: 1,
              measure: "piece",
              payment_subject: "service",
              payment_mode: "full_payment",
            },
          ],
        },
        confirmation: {
          type: "redirect",
          return_url: returnUrl,
        },
        save_payment_method: true,
        capture: true,
      },
      headers: {
        "Idempotence-Key": idempotenceKey,
      },
    });

    const createdYooKassaPaymentConfirmationUrl =
      createdYooKassaPayment.confirmation &&
      "confirmation_url" in createdYooKassaPayment.confirmation
        ? createdYooKassaPayment.confirmation.confirmation_url
        : undefined;

    if (!createdYooKassaPaymentConfirmationUrl) {
      return throwAPIError({
        code: APIErrorCode.InternalServerError,
        message:
          "Произошла ошибка при инициализации платежа для пакета кредитов",
      });
    }

    const { createdPayment } = await db.transaction(async (tx) => {
      const [createdPayment] = await tx
        .insert(payment)
        .values({
          userId: user.id,
          amount: amountValue,
          currency: "RUB",
          paymentId: createdYooKassaPayment.id,
          paymentLink: createdYooKassaPaymentConfirmationUrl,
          status: "pending",
        })
        .returning();

      await tx.insert(creditsPackageToPayment).values({
        creditsPackageId: foundCreditsPackage.id,
        paymentId: createdPayment.id,
      });

      return { createdPayment };
    });

    return c.json<InitiateCreditsPackagePaymentResponse>(
      initiateCreditsPackagePaymentResponseSchema.parse({
        data: {
          paymentLink: createdPayment.paymentLink,
        },
      }),
    );
  },
);
