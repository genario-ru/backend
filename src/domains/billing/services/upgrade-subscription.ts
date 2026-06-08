import { eq } from "drizzle-orm";

import { db } from "@/db";
import { subscription } from "@/db/schema";
import type { Transaction } from "@/db/types";
import type { Subscription } from "@/domains/subscriptions/schemas/entities/subscription";
import { APIErrorCode } from "@/shared/schemas/errors/api-error";
import { throwAPIError } from "@/shared/utils/server/throw-api-error";

import { cancelPendingSubscriptions } from "./cancel-pending-subscriptions";

type UpgradeSubscriptionParams = {
  userId: string;
  tariffId: string;
  tx?: Transaction;
};

type UpgradeSubscriptionResult = {
  createdSubscription: Subscription;
};

// Апгрейдит активную подписку пользователя на новый тариф. ЮКасса не вызывается:
// создается новая ожидающая подписка, которая начнет действовать сразу после
// окончания цикла текущей активной подписки. Используется в ручке апгрейда
// подписки, где у пользователя всегда есть активная подписка.

export async function upgradeSubscription({
  userId,
  tariffId,
  tx: txParam,
}: UpgradeSubscriptionParams): Promise<UpgradeSubscriptionResult> {
  const tx = txParam ?? db;

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

  if (activeSubscriptions.length > 1) {
    throw throwAPIError({
      code: APIErrorCode.BusinessRuleViolation,
      message: "Вы не можете иметь более одной активной подписки",
    });
  }

  // У пользователя должна быть активная подписка для апгрейда. Обычно ее наличие
  // гарантируется "subscriptionMiddleware", но проверяем защитно.

  const [activeSubscription] = activeSubscriptions;

  if (!activeSubscription) {
    throw throwAPIError({
      code: APIErrorCode.BusinessRuleViolation,
      message: "У вас нет активной подписки для апгрейда",
    });
  }

  // Нельзя апгрейдить подписку на тариф активной подписки.

  if (activeSubscription.tariffId === tariffId) {
    throw throwAPIError({
      code: APIErrorCode.Forbidden,
      message: "Вы не можете оформить подписку по тарифу активной подписки",
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
  // Это могут быть ранее выбранные "следующие" подписки.

  await cancelPendingSubscriptions({ userId, tx: txParam });

  // Убираем дату следующей оплаты у активной подписки и проставляем ей дату
  // окончания на дату окончания ее цикла. После этого создаем новую подписку,
  // которая начнется сразу после окончания цикла активной подписки.

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
