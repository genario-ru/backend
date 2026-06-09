import { partition } from "es-toolkit";

import { db } from "@/db";
import { initiateSubscriptionRecurringPayment } from "@/domains/billing/services/initiate-subscription-recurring-payment";
import { terminateSubscription } from "@/domains/billing/services/terminate-subscription";
import { getNextReadyPendingSubscription } from "@/domains/billing/utils/get-next-ready-pending-subscription";

export async function updateAndChargeSubscriptions() {
  const foundUsersWithSubscriptions = await db.query.user.findMany({
    with: {
      subscriptions: {
        orderBy: (subscription, { desc }) => desc(subscription.createdAt),
        where: (subscription, { inArray }) =>
          inArray(subscription.status, [
            "pending",
            "active",
            "overdue",
            "cancelled",
          ]),
        with: {
          tariff: true,
        },
      },
    },
  });

  // Проходимся по подпискам каждого пользователя, проверяем даты, статусы и т.д.,
  // обновляем статусы, проводим платежи, активируем подписки и т.д.
  for (const foundUser of foundUsersWithSubscriptions) {
    // Пропускаем пользователей без подписок
    if (!foundUser.subscriptions.length) {
      continue;
    }

    // Разделяем ожидающие оплаты подписки и текущую подписку пользователя.
    // Текущей считаем active / overdue / cancelled, то есть все статусы,
    // которые уже относятся к предоставленному доступу или его завершению.
    const [pendingSubscriptions, currentSubscriptions] = partition(
      foundUser.subscriptions,
      (foundSubscription) => foundSubscription.status === "pending",
    );

    if (currentSubscriptions.length > 1) {
      // TODO: Логируем в сервис отслеживания ошибок, потому что такого сценария быть не должно
      continue;
    }

    const currentDate = new Date();
    const [foundSubscription] = currentSubscriptions;

    const nextPendingSubscription = getNextReadyPendingSubscription({
      pendingSubscriptions,
      currentDate,
    });

    if (!foundSubscription) {
      // Если текущей подписки нет, но есть отложенная pending-подписка со
      // стартом в прошлом или сейчас, пробуем провести оплату для ее активации.
      // Pending-подписки без startsAt не трогаем: это может быть незавершенная
      // первичная оплата, и cron не должен списывать ее автоматически.
      if (!nextPendingSubscription) {
        continue;
      }

      await initiateSubscriptionRecurringPayment({
        userId: foundUser.id,
        userEmail: foundUser.email,
        subscription: nextPendingSubscription,
      });

      continue;
    }

    const foundSubscriptionEndsAt = foundSubscription.endsAt;

    // Дата окончания проставляется только подпискам, которые не будут
    // продлеваться: невозобновляемый тариф, отмена или апгрейд (выбрана
    // следующая подписка). Поэтому подписку с датой окончания завершаем по ее
    // наступлении независимо от статуса и тарифа:
    // 1. Проверяем дату окончания.
    // 2. Если подписка еще не закончилась, ничего не делаем.
    // 3. Если подписка закончилась, обновляем статус на terminated.
    // 4. Проверяем наличие следующей pending-подписки и проводим оплату,
    //    если дата ее старта уже наступила.
    if (foundSubscriptionEndsAt) {
      // Если дата окончания подписки еще не наступила, переходим к следующему пользователю
      const foundSubscriptionEndsAtDate = new Date(foundSubscriptionEndsAt);
      const subscriptionIsStillActive =
        foundSubscriptionEndsAtDate > currentDate;

      if (subscriptionIsStillActive) {
        continue;
      }

      // Если дата окончания подписки наступила, завершаем текущую подписку
      await terminateSubscription({
        userId: foundUser.id,
        subscriptionId: foundSubscription.id,
      });

      // Если нет готовой к оплате следующей pending-подписки, переходим к следующему пользователю
      if (!nextPendingSubscription) {
        continue;
      }

      await initiateSubscriptionRecurringPayment({
        userId: foundUser.id,
        userEmail: foundUser.email,
        subscription: nextPendingSubscription,
      });

      continue;
    }

    const foundSubscriptionNextBillingAt = foundSubscription.nextBillingAt;

    // Для подписок без даты окончания, то есть продлеваемых:
    // 1. Проверяем дату следующего биллинга.
    // 2. Если дата еще не наступила, ничего не делаем.
    // 3. Если дата наступила, инициируем рекуррентную оплату подписки.
    if (!foundSubscriptionNextBillingAt) {
      continue;
    }

    // Если дата следующего биллинга еще не наступила, переходим к следующему пользователю
    const foundSubscriptionNextBillingAtDate = new Date(
      foundSubscriptionNextBillingAt,
    );

    const nextBillingIsInFuture =
      foundSubscriptionNextBillingAtDate > currentDate;

    if (nextBillingIsInFuture) {
      continue;
    }

    // Если дата следующего биллинга наступила, инициируем оплату подписки
    await initiateSubscriptionRecurringPayment({
      userId: foundUser.id,
      userEmail: foundUser.email,
      subscription: foundSubscription,
    });
  }
}
