import type { SubscriptionWithTariff } from "@/domains/subscriptions/schemas/entities/subscription";

import { getNextPlannedPendingSubscription } from "./get-next-planned-pending-subscription";
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

export function getUpcomingSubscriptionCharge({
  subscriptions,
}: GetUpcomingSubscriptionChargeParams):
  | UpcomingSubscriptionCharge
  | undefined {
  const activeSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "active",
  );

  const pendingSubscriptions = subscriptions.filter(
    (subscription) => subscription.status === "pending",
  );

  const hasSingleActiveSubscription = activeSubscriptions.length === 1;

  if (!hasSingleActiveSubscription) {
    // TODO: Логируем в сервис отслеживания ошибок, потому что такого сценария быть не должно
    return undefined;
  }

  const [activeSubscription] = activeSubscriptions;
  const activeTariffIsRenewable = activeSubscription.tariff.isRenewable;

  if (activeTariffIsRenewable) {
    const chargeAt = getSubscriptionChargeDate(activeSubscription);

    if (!chargeAt) {
      return undefined;
    }

    return {
      chargeAt,
      subscriptionId: activeSubscription.id,
      tariffName: activeSubscription.tariff.name,
      tariffPrice: activeSubscription.tariff.price,
    };
  }

  const nextPlannedPendingSubscription = getNextPlannedPendingSubscription({
    pendingSubscriptions,
  });

  if (!nextPlannedPendingSubscription) {
    return undefined;
  }

  const chargeAt = getSubscriptionChargeDate(nextPlannedPendingSubscription);

  if (!chargeAt) {
    return undefined;
  }

  return {
    chargeAt,
    subscriptionId: nextPlannedPendingSubscription.id,
    tariffName: nextPlannedPendingSubscription.tariff.name,
    tariffPrice: nextPlannedPendingSubscription.tariff.price,
  };
}
