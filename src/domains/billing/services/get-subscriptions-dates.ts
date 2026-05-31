import { addDays, addMonths, addYears } from "date-fns";

import type { Payment } from "@/codegen/api/yookassa";
import type { SubscriptionWithTariff } from "@/domains/subscriptions/schemas/entities/subscription";

export function getSubscriptionsDates(
  payment: Payment,
  subscription: SubscriptionWithTariff,
  nextSubscription?: SubscriptionWithTariff | null,
) {
  let subscriptionCycleEndsAt: string | undefined;
  let subscriptionNextBillingAt: string | undefined;
  let subscriptionEndsAt: string | undefined;

  const subscriptionStartsAt =
    subscription.startsAt ?? new Date().toISOString();

  const subscriptionCycleStartsAt =
    subscription.cycleEndsAt ??
    subscription.startsAt ??
    new Date().toISOString();

  const subscriptionLastBilledAt =
    payment.captured_at ?? new Date().toISOString();

  // Если у тарифа подписки есть продолжительность в днях, то используем ее
  if (subscription.tariff.durationDays) {
    subscriptionCycleEndsAt = addDays(
      subscriptionCycleStartsAt,
      subscription.tariff.durationDays,
    ).toISOString();

    if (subscription.tariff.isRenewable) {
      subscriptionNextBillingAt = addDays(
        subscriptionLastBilledAt,
        subscription.tariff.durationDays,
      ).toISOString();
    }
  } else {
    // В ином случае используем период биллинга тарифа
    const subscriptionBillingPeriod = subscription.tariff.billingPeriod;

    subscriptionCycleEndsAt =
      subscriptionBillingPeriod === "year"
        ? addYears(subscriptionCycleStartsAt, 1).toISOString()
        : addMonths(subscriptionCycleStartsAt, 1).toISOString();

    if (subscription.tariff.isRenewable) {
      subscriptionNextBillingAt =
        subscriptionBillingPeriod === "year"
          ? addYears(subscriptionLastBilledAt, 1).toISOString()
          : addMonths(subscriptionLastBilledAt, 1).toISOString();
    }
  }

  // Если тариф не является возобновляемым, то дата окончания подписки совпадает с датой окончания ее текущего цикла
  if (!subscription.tariff.isRenewable) {
    subscriptionEndsAt = subscriptionCycleEndsAt;
  }

  // Если есть следующая подписка, то убираем даты следующего биллинга и ставим дату окончания подписки на дату окончания ее текущего цикла
  if (nextSubscription) {
    subscriptionEndsAt = subscriptionCycleEndsAt;
    subscriptionNextBillingAt = undefined;
  } else {
    // Если нет следующей подписки, то сразу возвращаем даты текущей подписки
    return {
      subscriptionCycleStartsAt,
      subscriptionCycleEndsAt,
      subscriptionNextBillingAt,
      subscriptionLastBilledAt,
      subscriptionStartsAt,
      subscriptionEndsAt,
    };
  }

  const nextSubscriptionStartsAt = subscriptionEndsAt;
  const nextSubscriptionNextBillingAt = nextSubscriptionStartsAt;

  return {
    subscriptionCycleStartsAt,
    subscriptionCycleEndsAt,
    subscriptionNextBillingAt,
    subscriptionLastBilledAt,
    subscriptionStartsAt,
    subscriptionEndsAt,
    nextSubscriptionStartsAt,
    nextSubscriptionNextBillingAt,
  };
}
