import { beforeEach, describe, expect, it, vi } from "vitest";

import { creditsBatch, payment, subscription } from "@/db/schema";

const mocks = vi.hoisted(() => {
  const postPayments = vi.fn();
  const db = {
    query: {
      payment: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
      paymentMethod: {
        findMany: vi.fn(),
      },
    },
    transaction: vi.fn(),
    update: vi.fn(),
  };

  return { db, postPayments };
});

vi.mock("@/db", () => ({
  db: mocks.db,
}));

vi.mock("@/codegen/api/yookassa/clients/post-payments", () => ({
  postPayments: mocks.postPayments,
}));

const { processPaymentSucceededEvent } =
  await import("@/domains/billing/services/process-payment-succeeded-event");
const { processPaymentCanceledEvent } =
  await import("@/domains/billing/services/process-payment-canceled-event");
const { initiateSubscriptionRecurringPayment } =
  await import("@/domains/billing/services/initiate-subscription-recurring-payment");

type Operation =
  | { type: "update"; table: unknown; values: Record<string, unknown> }
  | { type: "insert"; table: unknown; values: Record<string, unknown> }
  | { type: "delete"; table: unknown };

function createTx(operations: Operation[]) {
  return {
    query: {
      paymentMethod: {
        findFirst: vi.fn(),
      },
      subscription: {
        findMany: vi
          .fn()
          .mockResolvedValue([{ id: "pending-subscription-id" }]),
      },
    },
    update: (table: unknown) => ({
      set: (values: Record<string, unknown>) => {
        operations.push({ type: "update", table, values });

        return {
          where: () => ({
            returning: async () => [],
          }),
        };
      },
    }),
    insert: (table: unknown) => ({
      values: (values: Record<string, unknown>) => {
        operations.push({ type: "insert", table, values });

        return {
          returning: async () => [{ id: "created-credits-batch-id" }],
        };
      },
    }),
    delete: (table: unknown) => ({
      where: async () => {
        operations.push({ type: "delete", table });
      },
    }),
  };
}

function wireTransaction(operations: Operation[]) {
  mocks.db.transaction.mockImplementation(async (callback) =>
    callback(createTx(operations)),
  );
}

beforeEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe("processPaymentSucceededEvent", () => {
  it("updates the linked next subscription instead of creating a duplicate", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-31T16:03:45.026Z"));

    const operations: Operation[] = [];
    wireTransaction(operations);

    mocks.db.query.payment.findFirst.mockResolvedValue({
      id: "local-payment-id",
      userId: "user-id",
      status: "pending",
      subscriptionToPayment: {
        subscription: {
          id: "trial-subscription-id",
          startsAt: null,
          cycleEndsAt: null,
          tariff: {
            durationDays: 3,
            billingPeriod: null,
            isRenewable: false,
            creditsPackage: {
              id: "trial-credits-package-id",
              name: "Trial credits",
              description: "Trial credits",
              amount: 100,
            },
          },
        },
        nextSubscription: {
          id: "next-subscription-id",
          tariff: {
            id: "basic-tariff-id",
            durationDays: null,
            billingPeriod: "month",
            isRenewable: true,
            creditsPackage: null,
          },
        },
      },
      creditsBatchToPayment: null,
    });

    await processPaymentSucceededEvent({
      event: "payment.succeeded",
      object: {
        id: "yk-payment-id",
        status: "succeeded",
        captured_at: "2026-05-31T16:03:44.709Z",
      },
    } as never);

    const nextSubscriptionUpdate = operations.find(
      (operation) =>
        operation.type === "update" &&
        operation.table === subscription &&
        operation.values.startsAt === "2026-06-03T16:03:45.026Z",
    );

    expect(nextSubscriptionUpdate).toMatchObject({
      type: "update",
      values: {
        nextBillingAt: "2026-06-03T16:03:45.026Z",
        status: "pending",
      },
    });

    expect(
      operations.some(
        (operation) =>
          operation.type === "insert" && operation.table === subscription,
      ),
    ).toBe(false);

    expect(
      operations.filter(
        (operation) =>
          operation.type === "insert" && operation.table === creditsBatch,
      ),
    ).toHaveLength(1);
  });

  it("ignores repeated succeeded webhooks", async () => {
    mocks.db.query.payment.findFirst.mockResolvedValue({
      id: "local-payment-id",
      userId: "user-id",
      status: "succeeded",
      subscriptionToPayment: {
        subscription: null,
        nextSubscription: null,
      },
      creditsBatchToPayment: null,
    });

    await processPaymentSucceededEvent({
      event: "payment.succeeded",
      object: {
        id: "yk-payment-id",
        status: "succeeded",
      },
    } as never);

    expect(mocks.db.transaction).not.toHaveBeenCalled();
  });
});

describe("processPaymentCanceledEvent", () => {
  it("deletes abandoned pending subscriptions on checkout cancel", async () => {
    const operations: Operation[] = [];
    wireTransaction(operations);

    mocks.db.query.payment.findFirst.mockResolvedValue({
      id: "local-payment-id",
      userId: "user-id",
      status: "pending",
      paymentLink: "https://example.test/confirm",
      subscriptionToPayment: {
        subscription: {
          id: "trial-subscription-id",
          status: "pending",
          failedBillingAttempts: 0,
        },
      },
    });

    await processPaymentCanceledEvent({
      event: "payment.canceled",
      object: {
        id: "yk-payment-id",
        status: "canceled",
      },
    } as never);

    expect(
      operations.some(
        (operation) =>
          operation.type === "delete" && operation.table === subscription,
      ),
    ).toBe(true);

    expect(
      operations.some(
        (operation) =>
          operation.type === "update" && operation.table === subscription,
      ),
    ).toBe(false);
  });

  it("marks recurring subscription payments as overdue", async () => {
    const operations: Operation[] = [];
    wireTransaction(operations);

    mocks.db.query.payment.findFirst.mockResolvedValue({
      id: "local-payment-id",
      userId: "user-id",
      status: "pending",
      paymentLink: null,
      subscriptionToPayment: {
        subscription: {
          id: "subscription-id",
          status: "active",
          failedBillingAttempts: 0,
        },
      },
    });

    await processPaymentCanceledEvent({
      event: "payment.canceled",
      object: {
        id: "yk-payment-id",
        status: "canceled",
      },
    } as never);

    expect(
      operations.find(
        (operation) =>
          operation.type === "update" &&
          operation.table === subscription &&
          operation.values.status === "overdue",
      ),
    ).toMatchObject({
      values: {
        failedBillingAttempts: 1,
        status: "overdue",
      },
    });
  });
});

describe("initiateSubscriptionRecurringPayment", () => {
  it("uses YooKassa payment method id externally and local id internally", async () => {
    const operations: Operation[] = [];
    wireTransaction(operations);

    mocks.db.query.paymentMethod.findMany.mockResolvedValue([
      {
        id: "local-payment-method-id",
        paymentMethodId: "yk-payment-method-id",
      },
    ]);
    mocks.db.query.payment.findMany.mockResolvedValue([]);
    mocks.postPayments.mockResolvedValue({
      id: "yk-recurring-payment-id",
    });

    await initiateSubscriptionRecurringPayment({
      userId: "user-id",
      userEmail: "user@example.test",
      subscription: {
        id: "subscription-id",
        failedBillingAttempts: 0,
        tariff: {
          price: 790,
          name: "Basic",
        },
      },
    } as never);

    expect(mocks.postPayments).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          payment_method_id: "yk-payment-method-id",
        }),
      }),
    );

    expect(
      operations.find(
        (operation) =>
          operation.type === "insert" &&
          operation.table === payment &&
          operation.values.paymentId === "yk-recurring-payment-id",
      ),
    ).toMatchObject({
      values: {
        paymentMethodId: "local-payment-method-id",
      },
    });
  });
});
