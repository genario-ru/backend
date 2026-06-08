import { randomUUID } from "crypto";

import { db } from "@/db";
import { payment, subscription, subscriptionToPayment } from "@/db/schema";
import type { Transaction } from "@/db/types";
import type { Subscription } from "@/domains/subscriptions/schemas/entities/subscription";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import type { Payment } from "../schemas/entities/payment";
import { prepareYooKassaPaymentParams } from "../utils/prepare-yookassa-payment-params";
import { cancelPendingSubscriptions } from "./cancel-pending-subscriptions";
import { createYooKassaPayment } from "./create-yookassa-payment";

type InitiateSubscriptionPaymentParams = {
  userId: string;
  tariffId: string;
  nextTariffId?: string;
  tariffSlug?: string;
  trialTariffSlug?: string;
  redirectPath?: string;
  tx?: Transaction;
};

type InitiateSubscriptionPaymentResult = {
  createdSubscription: Subscription;
  createdPayment: Payment;
};

// Инициирует оплату новой подписки: создает платеж в ЮКассе и связанные с ним
// ожидающие подписки. Используется в ручке инициации оплаты подписки, где у
// пользователя не должно быть активной подписки.

export async function initiateSubscriptionPayment({
  userId,
  tariffId,
  nextTariffId,
  tariffSlug,
  trialTariffSlug,
  redirectPath,
  tx: txParam,
}: InitiateSubscriptionPaymentParams): Promise<InitiateSubscriptionPaymentResult> {
  const tx = txParam ?? db;

  const foundUser = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, userId),
  });

  if (!foundUser) {
    throw throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Пользователь не найден",
    });
  }

  // Проверяем, не совпадает ли следующий тариф с текущим тарифом. Если
  // совпадает, то сразу выбрасываем ошибку.

  if (nextTariffId && nextTariffId === tariffId) {
    throw throwAPIError({
      code: APIErrorCode.Forbidden,
      message: "Следующий тариф не может быть совпадать с текущим тарифом",
    });
  }

  // Проверяем, существует ли указанный тариф. Если нет, то выбрасываем ошибку.

  const foundTariff = await db.query.tariff.findFirst({
    where: (tariff, { eq }) => eq(tariff.id, tariffId),
  });

  if (!foundTariff) {
    throw throwAPIError({
      code: APIErrorCode.NotFound,
      message: "Указанный тариф не существует",
    });
  }

  // Если указан следующий тариф, то проверяем, существует ли он. Если нет,
  // то выбрасываем ошибку.

  if (nextTariffId) {
    const foundNextTariff = await db.query.tariff.findFirst({
      where: (tariff, { eq }) => eq(tariff.id, nextTariffId),
    });

    if (!foundNextTariff) {
      throw throwAPIError({
        code: APIErrorCode.NotFound,
        message: "Указанный тариф для следующей подписки не существует",
      });
    }
  }

  // Разом получаем все подписки для этого пользователя, чтобы по 10 раз не
  // ходить в БД за ними.

  const foundSubscriptions = await db.query.subscription.findMany({
    where: (subscription, { eq }) => eq(subscription.userId, userId),
    with: {
      tariff: true,
    },
  });

  // Проверяем на наличие у пользователя активных, просроченных или отмененных
  // подписок. Отмененные подписки тоже считаются активными, потому что после
  // окончания срока действия она переходит в статус "terminated".

  const activeSubscriptions = foundSubscriptions.filter((subscription) =>
    ["active", "overdue", "cancelled"].includes(subscription.status),
  );

  // При инициации оплаты у пользователя не должно быть активных подписок.
  // Если активная подписка есть, то изменение тарифа должно проходить через
  // ручку апгрейда подписки.

  if (activeSubscriptions.length) {
    throw throwAPIError({
      code: APIErrorCode.BusinessRuleViolation,
      message: "Вы не можете оформить новую подписку, пока у вас есть активная",
    });
  }

  // Находим все подписки пользователя, которые не являются возобновляемыми,
  // и статус которых отличается от "pending". Т.е. подписки, которые уже были
  // использованы.

  const notPendingSubscriptions = foundSubscriptions.filter(
    (subscription) => subscription.status !== "pending",
  );

  const foundNonRenewableSubscriptions = notPendingSubscriptions.filter(
    (subscription) => !subscription.tariff.isRenewable,
  );

  // Проверяем, была ли уже у пользователя невозобновляемая подписка по
  // указанному тарифу. Если уже была, то выбрасываем ошибку.

  const userHadSpecifiedNonRenewableSubscription =
    foundNonRenewableSubscriptions.some(
      (subscription) => subscription.tariffId === tariffId,
    );

  if (userHadSpecifiedNonRenewableSubscription) {
    throw throwAPIError({
      code: APIErrorCode.Forbidden,
      message: "Вы не можете повторно оформить подписку по указанному тарифу",
    });
  }

  // Удаляем все ожидающие подписки пользователя и отменяем их ожидающие платежи.

  await cancelPendingSubscriptions({ userId, tx: txParam });

  // Готовим данные для запроса на создание платежа в ЮКассу.

  const idempotenceKey = randomUUID();

  const { amountValue, description, returnUrl } = prepareYooKassaPaymentParams({
    paymentId: idempotenceKey,
    tariff: foundTariff,
    userEmail: foundUser.email,
    tariffSlug,
    trialTariffSlug,
    redirectPath,
  });

  // Отправляем запрос на создание платежа в ЮКассу.

  const createdYooKassaPayment = await createYooKassaPayment({
    amountValue,
    description,
    userEmail: foundUser.email,
    receiptItemDescription: description,
    returnUrl,
    idempotenceKey,
  });

  // Проверяем, содержит ли созданный платеж ссылку на оплату. Если нет, то
  // выбрасываем ошибку, потому что это означает, что создался некорректный
  // платеж.

  if (
    !createdYooKassaPayment.confirmation ||
    !("confirmation_url" in createdYooKassaPayment.confirmation)
  ) {
    throw throwAPIError({
      code: APIErrorCode.InternalServerError,
      message: "Созданный платеж не содержит ссылку на оплату",
    });
  }

  // Если созданный платеж содержит ссылку на оплату, то создаем новую подписку
  // и связываем ее с платежом. Если указан следующий тариф, то создаем новую
  // подписку для него тоже. Впоследствии, мы сможем определить, какую подписку
  // активировать первой через запись в таблице "subscriptionToPayment".

  const createdYooKassaPaymentConfirmationUrl =
    createdYooKassaPayment.confirmation.confirmation_url;

  const { createdSubscription, createdPayment } = await tx.transaction(
    async (tx) => {
      const [createdPayment] = await tx
        .insert(payment)
        .values({
          id: idempotenceKey,
          userId: foundUser.id,
          amount: amountValue,
          externalId: createdYooKassaPayment.id,
          paymentLink: createdYooKassaPaymentConfirmationUrl,
          currency: "RUB",
          status: "pending",
        })
        .returning();

      const [createdSubscription] = await tx
        .insert(subscription)
        .values({
          userId: foundUser.id,
          tariffId,
          status: "pending",
        })
        .returning();

      let nextSubscriptionId: string | undefined;

      if (nextTariffId) {
        const [createdNextSubscription] = await tx
          .insert(subscription)
          .values({
            userId: foundUser.id,
            tariffId: nextTariffId,
            status: "pending",
          })
          .returning();

        nextSubscriptionId = createdNextSubscription.id;
      }

      await tx.insert(subscriptionToPayment).values({
        subscriptionId: createdSubscription.id,
        nextSubscriptionId,
        paymentId: createdPayment.id,
      });

      return { createdSubscription, createdPayment };
    },
  );

  return { createdSubscription, createdPayment };
}
