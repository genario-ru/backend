import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const initiateSubscriptionRecurringPayment = vi.fn();
  const terminateSubscription = vi.fn();
  const db = {
    query: {
      user: {
        findMany: vi.fn(),
      },
    },
  };

  return { db, initiateSubscriptionRecurringPayment, terminateSubscription };
});

vi.mock("@/db", () => ({
  db: mocks.db,
}));

vi.mock(
  "@/domains/billing/services/initiate-subscription-recurring-payment",
  () => ({
    initiateSubscriptionRecurringPayment:
      mocks.initiateSubscriptionRecurringPayment,
  }),
);

vi.mock("@/domains/billing/services/terminate-subscription", () => ({
  terminateSubscription: mocks.terminateSubscription,
}));

const { updateAndChargeSubscriptions } =
  await import("@/domains/billing/services/update-and-charge-subscriptions");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("updateAndChargeSubscriptions", () => {
  it("does not crash or charge users with only pending subscriptions without startsAt", async () => {
    mocks.db.query.user.findMany.mockResolvedValue([
      {
        id: "user-id",
        email: "user@example.test",
        subscriptions: [
          {
            id: "pending-subscription-id",
            status: "pending",
            startsAt: null,
            tariff: {
              isRenewable: true,
            },
          },
        ],
      },
    ]);

    await expect(updateAndChargeSubscriptions()).resolves.toBeUndefined();
    expect(mocks.initiateSubscriptionRecurringPayment).not.toHaveBeenCalled();
  });

  it("terminates expired trial and charges the ready next subscription", async () => {
    mocks.db.query.user.findMany.mockResolvedValue([
      {
        id: "user-id",
        email: "user@example.test",
        subscriptions: [
          {
            id: "trial-subscription-id",
            status: "active",
            endsAt: "2026-01-01T00:00:00.000Z",
            nextBillingAt: null,
            tariff: {
              isRenewable: false,
            },
          },
          {
            id: "next-subscription-id",
            status: "pending",
            startsAt: "2026-01-01T00:00:00.000Z",
            tariff: {
              isRenewable: true,
            },
          },
        ],
      },
    ]);

    await updateAndChargeSubscriptions();

    expect(mocks.terminateSubscription).toHaveBeenCalledWith({
      userId: "user-id",
      subscriptionId: "trial-subscription-id",
    });
    expect(mocks.initiateSubscriptionRecurringPayment).toHaveBeenCalledWith({
      userId: "user-id",
      userEmail: "user@example.test",
      subscription: expect.objectContaining({
        id: "next-subscription-id",
      }),
    });
  });

  it("terminates expired upgraded subscription and charges the ready next subscription", async () => {
    // После апгрейда активная подписка остается в статусе "active" с
    // возобновляемым тарифом, но с датой окончания и без даты следующего
    // биллинга. По наступлении даты окончания она должна завершаться.
    mocks.db.query.user.findMany.mockResolvedValue([
      {
        id: "user-id",
        email: "user@example.test",
        subscriptions: [
          {
            id: "upgraded-subscription-id",
            status: "active",
            endsAt: "2026-01-01T00:00:00.000Z",
            nextBillingAt: null,
            tariff: {
              isRenewable: true,
            },
          },
          {
            id: "next-subscription-id",
            status: "pending",
            startsAt: "2026-01-01T00:00:00.000Z",
            tariff: {
              isRenewable: true,
            },
          },
        ],
      },
    ]);

    await updateAndChargeSubscriptions();

    expect(mocks.terminateSubscription).toHaveBeenCalledWith({
      userId: "user-id",
      subscriptionId: "upgraded-subscription-id",
    });
    expect(mocks.initiateSubscriptionRecurringPayment).toHaveBeenCalledWith({
      userId: "user-id",
      userEmail: "user@example.test",
      subscription: expect.objectContaining({
        id: "next-subscription-id",
      }),
    });
  });

  it("does not terminate an active subscription before its endsAt", async () => {
    mocks.db.query.user.findMany.mockResolvedValue([
      {
        id: "user-id",
        email: "user@example.test",
        subscriptions: [
          {
            id: "upgraded-subscription-id",
            status: "active",
            endsAt: "2999-01-01T00:00:00.000Z",
            nextBillingAt: null,
            tariff: {
              isRenewable: true,
            },
          },
        ],
      },
    ]);

    await updateAndChargeSubscriptions();

    expect(mocks.terminateSubscription).not.toHaveBeenCalled();
    expect(mocks.initiateSubscriptionRecurringPayment).not.toHaveBeenCalled();
  });
});
