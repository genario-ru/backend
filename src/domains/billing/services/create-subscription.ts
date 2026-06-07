import { randomUUID } from "crypto";
import { and, eq, inArray } from "drizzle-orm";
import { partition } from "es-toolkit";

import { db } from "@/db";
import { payment, subscription, subscriptionToPayment } from "@/db/schema";
import type { Transaction } from "@/db/types";
import type { Subscription } from "@/domains/subscriptions/schemas/entities/subscription";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import type { Payment } from "../schemas/entities/payment";
import { prepareYooKassaPaymentParams } from "../utils/prepare-yookassa-payment-params";
import { createYooKassaPayment } from "./create-yookassa-payment";
import { getLastPendingPayments } from "./get-last-pending-payments";

type CreateSubscriptionParams = {
  userId: string;
  tariffId: string;
  nextTariffId?: string;
  redirectPath?: string;
  tx?: Transaction;
};

type CreateSubscriptionResult = {
  createdSubscription: Subscription;
  createdPayment?: Payment;
};

export async function createSubscription({
  userId,
  tariffId,
  nextTariffId,
  redirectPath,
  tx: txParam,
}: CreateSubscriptionParams): Promise<CreateSubscriptionResult> {
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
  // то выбрасываем ошибку. В противном случае сохраняем найденный тариф.

  if (nextTariffId) {
    const localFoundNextTariff = await db.query.tariff.findFirst({
      where: (tariff, { eq }) => eq(tariff.id, nextTariffId),
    });

    if (!localFoundNextTariff) {
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
      subscriptionToPayment: {
        with: {
          payment: true,
        },
      },
    },
  });

  // Проверяем на наличие у пользователя активных, просроченных или отмененных
  // подписок. Отмененные подписки тоже считаются активными, потому что после
  // окончания срока действия она переходит в статус "terminated".

  const activeSubscriptions = foundSubscriptions.filter((subscription) =>
    ["active", "overdue", "cancelled"].includes(subscription.status),
  );

  if (activeSubscriptions.length > 1) {
    throw throwAPIError({
      code: APIErrorCode.BusinessRuleViolation,
      message: "Вы не можете иметь более одной активной подписки",
    });
  }

  // Если указан следующий тариф, то при наличии активных подписок выбрасываем
  // ошибку, потому что при наличии активной подписки "tariffId" априори создает
  // следующую подписку, которая начнет действовать сразу после окончания текущей.

  if (nextTariffId && activeSubscriptions.length) {
    throw throwAPIError({
      code: APIErrorCode.Forbidden,
      message:
        "Вы не можете иметь указать следующий тариф, пока у вас есть активные подписки",
    });
  }

  // Если у пользователя есть активная подписка, то проверяем, не совпадает ли
  // тариф активной подписки с указанным тарифом. Если совпадает, то выбрасываем
  // ошибку, потому что нельзя оформить подписку по тарифу активной подписки.

  const [activeSubscription] = activeSubscriptions;

  if (activeSubscription && activeSubscription.tariffId === tariffId) {
    throw throwAPIError({
      code: APIErrorCode.Forbidden,
      message: "Вы не можете оформить подписку по тарифу активной подписки",
    });
  }

  const [pendingSubscriptions, notPendingSubscriptions] = partition(
    foundSubscriptions,
    (subscription) => subscription.status === "pending",
  );

  // Находим все подписки пользователя, которые не являются возобновляемыми,
  // и статус которых отличается от "pending". Т.е. подписки, которые уже были
  // использованы.

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

  if (pendingSubscriptions.length) {
    // Удаляем все ожидающие подписки для этого пользователя. Это могут быть
    // подписки по тарифу, который он выбрал следующими или просто ожидающие
    // оплаты подписки, по которым не был проведен платеж.

    await tx.transaction(async (tx) => {
      await tx.delete(subscription).where(
        and(
          inArray(
            subscription.id,
            pendingSubscriptions.map((subscription) => subscription.id),
          ),
          eq(subscription.userId, userId),
        ),
      );

      // Ожидающие платежи по этим подпискам отменяем, но не удаляем, чтобы состав
      // платежей полностью соответствовал платежам в платежном провайдере.

      const pendingSubscriptionPayments = await getLastPendingPayments({
        userId,
        subscriptionIds: pendingSubscriptions.map(
          (subscription) => subscription.id,
        ),
      });

      if (pendingSubscriptionPayments.length) {
        await tx
          .update(payment)
          .set({
            status: "canceled",
            statusDetails: "Платеж отменен в связи с созданием новой подписки",
          })
          .where(
            inArray(
              payment.id,
              pendingSubscriptionPayments.map((payment) => payment.id),
            ),
          );
      }
    });
  }

  // Если у пользователя уже есть активная подписка, то убираем дату следующей
  // оплаты у текущей подписки и проставляем ей дату окончания на дату окончания
  // ее цикла. После этого создаем новую подписку, которая начнется сразу после
  // окончания цикла активной подписки.

  if (activeSubscription) {
    const activeSubscriptionCycleEndsAt = activeSubscription.cycleEndsAt;

    if (!activeSubscriptionCycleEndsAt) {
      throw throwAPIError({
        code: APIErrorCode.BusinessRuleViolation,
        message: "Активная подписка не имеет даты окончания цикла",
      });
    }

    const createdSubscription = await tx.transaction(async (tx) => {
      await tx
        .update(subscription)
        .set({
          nextBillingAt: null,
          endsAt: activeSubscriptionCycleEndsAt,
        })
        .where(eq(subscription.id, activeSubscription.id));

      const [createdSubscription] = await tx
        .insert(subscription)
        .values({
          userId,
          tariffId,
          startsAt: activeSubscriptionCycleEndsAt,
          status: "pending",
        })
        .returning();

      return createdSubscription;
    });

    return { createdSubscription };
  }

  // Если у пользователя нет активных подписок, то готовим данные для запроса
  // на создание платежа в ЮКассу.

  const idempotenceKey = randomUUID();

  const { amountValue, description, returnUrl } = prepareYooKassaPaymentParams({
    paymentId: idempotenceKey,
    tariff: foundTariff,
    userEmail: foundUser.email,
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
