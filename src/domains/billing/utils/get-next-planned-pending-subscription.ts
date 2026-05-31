import type { SubscriptionWithTariff } from "@/domains/subscriptions/schemas/entities/subscription";

import { getSubscriptionChargeDate } from "./get-subscription-charge-date";

type GetNextPlannedPendingSubscriptionParams = {
  pendingSubscriptions: SubscriptionWithTariff[];
};

type PendingSubscriptionWithChargeDate = {
  chargeAt: string;
  subscription: SubscriptionWithTariff;
};

export function getNextPlannedPendingSubscription({
  pendingSubscriptions,
}: GetNextPlannedPendingSubscriptionParams) {
  const pendingSubscriptionsWithChargeDate = pendingSubscriptions
    .map((subscription): PendingSubscriptionWithChargeDate | null => {
      const chargeAt = getSubscriptionChargeDate(subscription);

      if (!chargeAt) {
        return null;
      }

      return {
        chargeAt,
        subscription,
      };
    })
    .filter((subscription): subscription is PendingSubscriptionWithChargeDate =>
      Boolean(subscription),
    );

  return pendingSubscriptionsWithChargeDate.sort((a, b) => {
    const aChargeAt = new Date(a.chargeAt).getTime();
    const bChargeAt = new Date(b.chargeAt).getTime();

    return aChargeAt - bChargeAt;
  })[0]?.subscription;
}
