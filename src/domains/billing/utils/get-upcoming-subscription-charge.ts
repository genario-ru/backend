import type { SubscriptionWithTariff } from "@/domains/subscriptions/schemas/entities/subscription";

import { getSubscriptionChargeDate } from "./get-subscription-charge-date";

type GetUpcomingSubscriptionChargeParams = {
  subscriptions: SubscriptionWithTariff[];
};

export type UpcomingSubscriptionCharge = {
  chargeAt: string;
  subscriptionId: string;
  tariffName: string;
  tariffPrice: number;
};

type SubscriptionWithChargeDate = {
  chargeAt: string;
  subscription: SubscriptionWithTariff;
};

export function getUpcomingSubscriptionCharge({
  subscriptions,
}: GetUpcomingSubscriptionChargeParams):
  | UpcomingSubscriptionCharge
  | undefined {
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "active",
  );

  const hasSingleActiveSubscription = activeSubscriptions.length === 1;

  if (!hasSingleActiveSubscription) {
    // TODO: Логируем в сервис отслеживания ошибок, потому что такого сценария быть не должно
    return undefined;
  }

  // Для каждой подписки вычисляем дату ее ближайшего списания: у возобновляемой
  // активной подписки это nextBillingAt, у запланированной pending-подписки —
  // ее startsAt. Подписки без даты списания (например, невозобновляемая активная
  // или незавершенная первичная оплата) пропускаем.

  const subscriptionsWithChargeDate = subscriptions
    .map((subscription): SubscriptionWithChargeDate | null => {
      const chargeAt = getSubscriptionChargeDate(subscription);

      if (!chargeAt) {
        return null;
      }

      return {
        chargeAt,
        subscription,
      };
    })
    .filter((subscription): subscription is SubscriptionWithChargeDate =>
      Boolean(subscription),
    );

  // Берем самое раннее предстоящее списание среди всех подписок пользователя.

  const nearestUpcomingCharge = subscriptionsWithChargeDate.sort((a, b) => {
    const aChargeAt = new Date(a.chargeAt).getTime();
    const bChargeAt = new Date(b.chargeAt).getTime();

    return aChargeAt - bChargeAt;
  })[0];

  if (!nearestUpcomingCharge) {
    return undefined;
  }

  const { chargeAt, subscription } = nearestUpcomingCharge;

  return {
    chargeAt,
    subscriptionId: subscription.id,
    tariffName: subscription.tariff.name,
    tariffPrice: subscription.tariff.price,
  };
}
