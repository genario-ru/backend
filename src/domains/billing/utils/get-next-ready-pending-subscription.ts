import type { SubscriptionWithTariff } from "@/domains/subscriptions/schemas/entities/subscription";

type GetNextReadyPendingSubscriptionParams = {
  pendingSubscriptions: SubscriptionWithTariff[];
  currentDate: Date;
};

// Выбираем ближайшую pending-подписку, которую уже можно списывать.
// Подписки без startsAt намеренно пропускаем: они создаются при первичной
// оплате и должны активироваться только через webhook успешного платежа.
export function getNextReadyPendingSubscription({
  pendingSubscriptions,
  currentDate,
}: GetNextReadyPendingSubscriptionParams) {
  return pendingSubscriptions
    .filter((subscription) => {
      const subscriptionStartsAt = subscription.startsAt;

      if (!subscriptionStartsAt) {
        return false;
      }

      const subscriptionStartsAtDate = new Date(subscriptionStartsAt);
      const subscriptionIsReady = subscriptionStartsAtDate <= currentDate;

      return subscriptionIsReady;
    })
    .sort((a, b) => {
      const aStartsAt = a.startsAt ? new Date(a.startsAt).getTime() : 0;
      const bStartsAt = b.startsAt ? new Date(b.startsAt).getTime() : 0;

      return aStartsAt - bStartsAt;
    })[0];
}
