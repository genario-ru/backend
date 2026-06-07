import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { creditsBatch, creditsBatchToPayment, payment } from "@/db/schema";
import { createYooKassaPayment } from "@/domains/billing/services/create-yookassa-payment";
import { prepareYooKassaCreditsPackagePaymentParams } from "@/domains/billing/utils/prepare-yookassa-credits-package-payment-params";
import { initiateCreditsPackagePaymentBodySchema } from "@/domains/credits/schemas/handlers/initiate-credits-package-payment/body";
import {
  type InitiateCreditsPackagePaymentResponse,
  initiateCreditsPackagePaymentResponseSchema,
} from "@/domains/credits/schemas/handlers/initiate-credits-package-payment/response";
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
    const { creditsPackageSlug, redirect: redirectPath } = c.req.valid("json");

    const foundCreditsPackage = await db.query.creditsPackage.findFirst({
      where: (creditsPackage, { eq, and }) =>
        and(
          eq(creditsPackage.slug, creditsPackageSlug),
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

    const lastPendingPayments = await db.query.payment.findMany({
      orderBy: (payment, { desc }) => desc(payment.createdAt),
      where: (payment, { and, eq }) =>
        and(eq(payment.status, "pending"), eq(payment.userId, user.id)),
      with: {
        creditsBatchToPayment: {
          with: {
            creditsBatch: {
              with: {
                creditsPackage: true,
              },
            },
          },
        },
      },
    });

    const lastPendingCreditsBatchPayment = lastPendingPayments.find(
      (payment) => {
        const linkedCreditsBatch = payment.creditsBatchToPayment?.creditsBatch;

        const isSameCreditsPackage =
          linkedCreditsBatch?.creditsPackageId === foundCreditsPackage.id;

        const isPending = linkedCreditsBatch?.status === "pending";

        return isSameCreditsPackage && isPending;
      },
    );

    const idempotenceKey =
      lastPendingCreditsBatchPayment?.creditsBatchToPayment?.paymentId ??
      randomUUID();

    const { amountValue, description, receiptItemDescription, returnUrl } =
      prepareYooKassaCreditsPackagePaymentParams({
        creditsPackage: foundCreditsPackage,
        userEmail: user.email,
        paymentId: idempotenceKey,
        redirectPath,
      });

    // Отправляем запрос к API ЮKassa

    const createdYooKassaPayment = await createYooKassaPayment({
      amountValue,
      description,
      userEmail: user.email,
      receiptItemDescription,
      returnUrl,
      idempotenceKey,
    });

    if (
      !createdYooKassaPayment.confirmation ||
      !("confirmation_url" in createdYooKassaPayment.confirmation)
    ) {
      return throwAPIError({
        code: APIErrorCode.InternalServerError,
        message:
          "Произошла ошибка при инициализации платежа для пакета кредитов",
      });
    }

    const createdYooKassaPaymentConfirmationUrl =
      createdYooKassaPayment.confirmation.confirmation_url;

    if (lastPendingCreditsBatchPayment) {
      await db
        .update(payment)
        .set({
          externalId: createdYooKassaPayment.id,
          paymentLink: createdYooKassaPaymentConfirmationUrl,
          amount: amountValue,
          currency: "RUB",
        })
        .where(eq(payment.id, lastPendingCreditsBatchPayment.id));

      return c.json<InitiateCreditsPackagePaymentResponse>(
        initiateCreditsPackagePaymentResponseSchema.parse({
          data: {
            paymentLink: createdYooKassaPaymentConfirmationUrl,
          },
        }),
      );
    }

    const createdPayment = await db.transaction(async (tx) => {
      const [[createdPayment], [createdCreditsBatch]] = await Promise.all([
        tx
          .insert(payment)
          .values({
            id: idempotenceKey,
            userId: user.id,
            amount: amountValue,
            currency: "RUB",
            externalId: createdYooKassaPayment.id,
            paymentLink: createdYooKassaPaymentConfirmationUrl,
            status: "pending",
          })
          .returning(),
        tx
          .insert(creditsBatch)
          .values({
            userId: user.id,
            creditsPackageId: foundCreditsPackage.id,
            name: foundCreditsPackage.name,
            description: foundCreditsPackage.description,
            remainingAmount: foundCreditsPackage.amount,
            status: "pending",
          })
          .returning(),
      ]);

      await tx.insert(creditsBatchToPayment).values({
        creditsBatchId: createdCreditsBatch.id,
        paymentId: createdPayment.id,
      });

      return createdPayment;
    });

    return c.json<InitiateCreditsPackagePaymentResponse>(
      initiateCreditsPackagePaymentResponseSchema.parse({
        data: createdPayment,
      }),
    );
  },
);
