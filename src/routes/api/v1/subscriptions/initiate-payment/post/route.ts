import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import { validator } from "hono-openapi";

import { db } from "@/db";
import { payment, subscription, subscriptionToPayment } from "@/db/schema";
import { cleanPendingSubscriptions } from "@/domains/billing/services/clean-pending-subscriptions";
import { createYooKassaPayment } from "@/domains/billing/services/create-yookassa-payment";
import { getLastPendingPayments } from "@/domains/billing/services/get-last-pending-payments";
import { prepareYooKassaPaymentParams } from "@/domains/billing/utils/prepare-yookassa-payment-params";
import { initiateSubscriptionPaymentBodySchema } from "@/domains/subscriptions/schemas/handlers/initiate-subscriptions-payment/body";
import {
  type InitiateSubscriptionPaymentResponse,
  initiateSubscriptionPaymentResponseSchema,
} from "@/domains/subscriptions/schemas/handlers/initiate-subscriptions-payment/response";
import type { Tariff } from "@/domains/tariffs/schemas/entities/tariff";
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
  sessionMiddleware,
  rateLimitMiddleware({
    keyPrefix: "initiate-subscription-payment",
    windowMs: 60 * 1000,
    limit: 10,
  }),
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

    const foundUserSubscriptions = await db.query.subscription.findMany({
      orderBy: (subscription, { desc }) => desc(subscription.createdAt),
      where: (subscription, { and, eq, inArray }) =>
        and(
          eq(subscription.userId, user.id),
          inArray(subscription.status, ["active", "overdue"]),
        ),
    });

    if (foundUserSubscriptions.length > 0) {
      return throwAPIError({
        code: APIErrorCode.Forbidden,
        message: "У вас уже есть активная подписка",
      });
    }

    const foundTariff = await db.query.tariff.findFirst({
      where: (tariff, { eq }) => eq(tariff.slug, tariffSlug),
    });

    if (!foundTariff) {
      return throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Указанный тариф не существует",
      });
    }

    let foundTrialTariff: Tariff | undefined;

    if (trialTariffSlug) {
      const localFoundTrialTariff = await db.query.tariff.findFirst({
        where: (tariff, { and, eq }) =>
          and(eq(tariff.slug, trialTariffSlug), eq(tariff.isRenewable, false)),
      });

      if (!localFoundTrialTariff) {
        return throwAPIError({
          code: APIErrorCode.NotFound,
          message: "Указанный тариф пробного периода не существует",
        });
      }

      const usedTrialTariffSubscription = await db.query.subscription.findFirst(
        {
          orderBy: (subscription, { desc }) => desc(subscription.createdAt),
          where: (subscription, { and, eq, ne }) =>
            and(
              eq(subscription.userId, user.id),
              eq(subscription.tariffId, localFoundTrialTariff.id),
              ne(subscription.status, "pending"),
            ),
        },
      );

      if (usedTrialTariffSubscription) {
        return throwAPIError({
          code: APIErrorCode.Forbidden,
          message: "Пробный период уже использован",
        });
      }

      foundTrialTariff = localFoundTrialTariff;
    }

    // Готовим данные для запроса к API ЮKassa

    const computedTariffId = foundTrialTariff
      ? foundTrialTariff.id
      : foundTariff.id;

    const lastPendingPayments = await getLastPendingPayments({
      userId: user.id,
    });

    const lastPendingSubscriptionPayment = lastPendingPayments.find(
      (payment) => {
        const linkedSubscription = payment.subscriptionToPayment?.subscription;
        const isSameTariff = linkedSubscription?.tariffId === computedTariffId;
        const isSubscriptionPending = linkedSubscription?.status === "pending";

        const linkedNextSubscription =
          payment.subscriptionToPayment?.nextSubscription;

        if (!linkedNextSubscription) {
          return isSameTariff && isSubscriptionPending;
        }

        const isSameNextTariff =
          !foundTrialTariff ||
          linkedNextSubscription.tariffId === foundTariff.id;

        const isNextSubscriptionPending =
          linkedNextSubscription.status === "pending";

        return (
          isSameTariff &&
          isSubscriptionPending &&
          isSameNextTariff &&
          isNextSubscriptionPending
        );
      },
    );

    const idempotenceKey = lastPendingSubscriptionPayment?.id ?? randomUUID();

    const { amountValue, description, returnUrl } =
      prepareYooKassaPaymentParams({
        tariff: foundTrialTariff,
        fallbackTariff: foundTariff,
        userEmail: user.email,
        redirectPath,
      });

    // Отправляем запрос к API ЮKassa

    const createdYooKassaPayment = await createYooKassaPayment({
      amountValue,
      description,
      userEmail: user.email,
      receiptItemDescription: description,
      returnUrl,
      idempotenceKey,
    });

    if (
      !createdYooKassaPayment.confirmation ||
      !("confirmation_url" in createdYooKassaPayment.confirmation)
    ) {
      return throwAPIError({
        code: APIErrorCode.InternalServerError,
        message: "Произошла ошибка при инициализации платежа для подписки",
      });
    }

    const createdYooKassaPaymentConfirmationUrl =
      createdYooKassaPayment.confirmation.confirmation_url;

    if (lastPendingSubscriptionPayment) {
      await db
        .update(payment)
        .set({
          paymentId: createdYooKassaPayment.id,
          paymentLink: createdYooKassaPaymentConfirmationUrl,
          amount: amountValue,
          currency: "RUB",
          status: "pending",
        })
        .where(eq(payment.id, lastPendingSubscriptionPayment.id));

      return c.json<InitiateSubscriptionPaymentResponse>(
        initiateSubscriptionPaymentResponseSchema.parse({
          data: {
            paymentLink: createdYooKassaPaymentConfirmationUrl,
          },
        }),
      );
    }

    await db.transaction(async (tx) => {
      const [createdPayment] = await tx
        .insert(payment)
        .values({
          id: idempotenceKey,
          userId: user.id,
          amount: amountValue,
          currency: "RUB",
          paymentId: createdYooKassaPayment.id,
          paymentLink: createdYooKassaPaymentConfirmationUrl,
          status: "pending",
        })
        .returning();

      let nextSubscriptionId: string | undefined;

      await cleanPendingSubscriptions({
        userId: user.id,
        tx,
      });

      const [createdSubscription] = await tx
        .insert(subscription)
        .values({
          userId: user.id,
          tariffId: computedTariffId,
          status: "pending",
        })
        .returning();

      const subscriptionId = createdSubscription.id;

      if (foundTrialTariff) {
        const [createdNextSubscription] = await tx
          .insert(subscription)
          .values({
            userId: user.id,
            tariffId: foundTariff.id,
            status: "pending",
          })
          .returning();

        nextSubscriptionId = createdNextSubscription.id;
      }

      await tx.insert(subscriptionToPayment).values({
        subscriptionId,
        nextSubscriptionId,
        paymentId: createdPayment.id,
      });
    });

    return c.json<InitiateSubscriptionPaymentResponse>(
      initiateSubscriptionPaymentResponseSchema.parse({
        data: {
          paymentLink: createdYooKassaPaymentConfirmationUrl,
        },
      }),
    );
  },
);
