import { partition } from "es-toolkit";

import { db } from "@/db";
import { initiateSubscriptionRecurringPayment } from "@/domains/billing/services/initiate-subscription-recurring-payment";
import { terminateSubscription } from "@/domains/billing/services/terminate-subscription";

export async function updateAndChargeSubscriptions() {
  const foundUsersWithSubscriptions = await db.query.user.findMany({
    with: {
      subscriptions: {
        orderBy: (subscription, { desc }) => desc(subscription.createdAt),
        where: (subscription, { inArray }) =>
          inArray(subscription.status, ["pending", "active", "overdue"]),
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

    const [pendingSubscriptions, activeSubscriptions] = partition(
      foundUser.subscriptions,
      (foundSubscription) => foundSubscription.status === "pending",
    );

    if (activeSubscriptions.length > 1) {
      // TODO: Логируем в сервис отслеживания ошибок, потому что такого сценария быть не должно
      continue;
    }

    const [foundSubscription] = activeSubscriptions;
    const foundSubscriptionIsRenewable = foundSubscription.tariff.isRenewable;
    const foundSubscriptionNextBillingAt = foundSubscription.nextBillingAt;
    const foundSubscriptionEndsAt = foundSubscription.endsAt;
    const currentDate = new Date();

    if (!foundSubscriptionIsRenewable) {
      // Для пользователей с невозобновляемыми подписками:
      // 1. Проверяем даты.
      // 2. Если подписка закончилась, то обновляем статус подписки на terminated.
      // 3. Проверяем наличие следующей подписки и проводим оплату при наличии и соблюдении других условий.

      if (!foundSubscriptionEndsAt) {
        // TODO: Логируем в сервис отслеживания ошибок, потому что такого сценария быть не должно
        continue;
      }

      const foundSubscriptionEndsAtDate = new Date(foundSubscriptionEndsAt);

      // Если дата окончания подписки меньше текущей даты, то пропускаем пользователя и переходим к следующему
      if (foundSubscriptionEndsAtDate < currentDate) {
        continue;
      }

      // Если дата окончания подписки больше текущей даты, то обновляем статус подписки на terminated
      await terminateSubscription({
        userId: foundUser.id,
        subscriptionId: foundSubscription.id,
      });

      // Если нет ожидающих оплаты подписок, то переходим к следующему пользователю
      if (!pendingSubscriptions.length) {
        continue;
      }

      const sortedPendingSubscriptions = pendingSubscriptions.sort((a, b) => {
        if (!a.startsAt || !b.startsAt) {
          // TODO: Логируем в сервис отслеживания ошибок, потому что такого сценария быть не должно
          return -1;
        }

        const aStartsAtDate = new Date(a.startsAt);
        const bStartsAtDate = new Date(b.startsAt);

        return aStartsAtDate.getTime() - bStartsAtDate.getTime();
      });

      const [nextPendingSubscription] = sortedPendingSubscriptions;

      const nextPendingSubscriptionNextStartsAt =
        nextPendingSubscription.startsAt;

      if (!nextPendingSubscriptionNextStartsAt) {
        // TODO: Логируем в сервис отслеживания ошибок, потому что такого сценария быть не должно
        return;
      }

      const nextPendingSubscriptionNextStartsAtDate = new Date(
        nextPendingSubscriptionNextStartsAt,
      );

      if (nextPendingSubscriptionNextStartsAtDate > currentDate) {
        // Если дата начала подписки еще не наступила, то переходим к следующему пользователю.
        continue;
      }

      await initiateSubscriptionRecurringPayment({
        userId: foundUser.id,
        userEmail: foundUser.email,
        subscription: nextPendingSubscription,
      });
    } else if (foundSubscriptionNextBillingAt) {
      // Для пользователей с возобновляемыми подписками:
      // 1. Проверяем даты.
      // 2. Если дата следующего биллинга меньше текущей даты, то инициируем оплату подписки и переходим к следующему пользователю.

      const foundSubscriptionNextBillingAtDate = new Date(
        foundSubscriptionNextBillingAt,
      );

      if (foundSubscriptionNextBillingAtDate > currentDate) {
        // Если дата следующего биллинга еще не наступила, то переходим к следующему пользователю.
        continue;
      }

      // Если дата следующего биллинга наступила, то инициируем оплату подписки и переходим к следующему пользователю.
      await initiateSubscriptionRecurringPayment({
        userId: foundUser.id,
        userEmail: foundUser.email,
        subscription: foundSubscription,
      });
    }
  }
}

await updateAndChargeSubscriptions();
