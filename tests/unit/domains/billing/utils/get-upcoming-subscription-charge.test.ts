import { describe, expect, it } from "vitest";

import { getUpcomingSubscriptionCharge } from "@/domains/billing/utils/get-upcoming-subscription-charge";

describe("getUpcomingSubscriptionCharge", () => {
  it("returns nextBillingAt for renewable active subscription", () => {
    const result = getUpcomingSubscriptionCharge({
      subscriptions: [
        {
          id: "active-subscription-id",
          status: "active",
          nextBillingAt: "2026-06-04T00:00:00.000Z",
          tariff: {
            isRenewable: true,
            name: "Базовый",
            price: 790,
          },
        },
      ] as never,
    });

    expect(result).toEqual({
      chargeAt: "2026-06-04T00:00:00.000Z",
      subscriptionId: "active-subscription-id",
      tariffName: "Базовый",
      tariffPrice: 790,
    });
  });

  it("returns nearest planned pending subscription for non-renewable active subscription", () => {
    const result = getUpcomingSubscriptionCharge({
      subscriptions: [
        {
          id: "trial-subscription-id",
          status: "active",
          nextBillingAt: null,
          tariff: {
            isRenewable: false,
            name: "Пробный период",
            price: 1,
          },
        },
        {
          id: "later-pending-subscription-id",
          status: "pending",
          startsAt: "2026-06-10T00:00:00.000Z",
          nextBillingAt: "2026-06-10T00:00:00.000Z",
          tariff: {
            isRenewable: true,
            name: "Профессиональный",
            price: 1490,
          },
        },
        {
          id: "next-pending-subscription-id",
          status: "pending",
          startsAt: "2026-06-04T00:00:00.000Z",
          nextBillingAt: "2026-06-04T00:00:00.000Z",
          tariff: {
            isRenewable: true,
            name: "Базовый",
            price: 790,
          },
        },
      ] as never,
    });

    expect(result).toEqual({
      chargeAt: "2026-06-04T00:00:00.000Z",
      subscriptionId: "next-pending-subscription-id",
      tariffName: "Базовый",
      tariffPrice: 790,
    });
  });
});
