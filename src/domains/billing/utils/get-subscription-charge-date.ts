import type { SubscriptionWithTariff } from "@/domains/subscriptions/schemas/entities/subscription";

type SubscriptionForChargeDate = Pick<
  SubscriptionWithTariff,
  "nextBillingAt" | "startsAt" | "status"
>;

export function getSubscriptionChargeDate(
  subscription: SubscriptionForChargeDate,
) {
  const nextBillingAt = subscription.nextBillingAt;

  if (nextBillingAt) {
    return nextBillingAt;
  }

  const subscriptionIsPending = subscription.status === "pending";

  if (!subscriptionIsPending) {
    return undefined;
  }

  return subscription.startsAt ?? undefined;
}
