import { beforeEach, describe, expect, it, vi } from "vitest";

import { paymentMethod } from "@/db/schema";

const mocks = vi.hoisted(() => {
  const db = {
    transaction: vi.fn(),
  };

  return { db };
});

vi.mock("@/db", () => ({
  db: mocks.db,
}));

const { selectDefaultPaymentMethod } =
  await import("@/domains/billing/services/select-default-payment-method");

type Operation = {
  table: unknown;
  values: Record<string, unknown>;
};

function createTx({
  foundPaymentMethod,
  updatedPaymentMethod,
  operations,
}: {
  foundPaymentMethod: unknown;
  updatedPaymentMethod: unknown;
  operations: Operation[];
}) {
  return {
    query: {
      paymentMethod: {
        findFirst: vi.fn().mockResolvedValue(foundPaymentMethod),
      },
    },
    update: (table: unknown) => ({
      set: (values: Record<string, unknown>) => {
        operations.push({ table, values });

        return {
          where: () => {
            if (values.default === true) {
              return {
                returning: async () => [updatedPaymentMethod],
              };
            }
          },
        };
      },
    }),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("selectDefaultPaymentMethod", () => {
  it("marks selected active payment method as default and resets previous defaults", async () => {
    const operations: Operation[] = [];
    const selectedPaymentMethod = {
      id: "payment-method-id",
      userId: "user-id",
      status: "active",
    };
    const updatedPaymentMethod = {
      ...selectedPaymentMethod,
      default: true,
    };

    mocks.db.transaction.mockImplementation(async (callback) =>
      callback(
        createTx({
          foundPaymentMethod: selectedPaymentMethod,
          updatedPaymentMethod,
          operations,
        }),
      ),
    );

    const result = await selectDefaultPaymentMethod({
      userId: "user-id",
      paymentMethodId: "payment-method-id",
    });

    expect(result).toEqual(updatedPaymentMethod);
    expect(operations).toEqual([
      {
        table: paymentMethod,
        values: { default: false },
      },
      {
        table: paymentMethod,
        values: { default: true },
      },
    ]);
  });

  it("does not update payment methods when selected method is unavailable", async () => {
    const operations: Operation[] = [];

    mocks.db.transaction.mockImplementation(async (callback) =>
      callback(
        createTx({
          foundPaymentMethod: null,
          updatedPaymentMethod: null,
          operations,
        }),
      ),
    );

    await expect(
      selectDefaultPaymentMethod({
        userId: "user-id",
        paymentMethodId: "payment-method-id",
      }),
    ).rejects.toThrow();

    expect(operations).toEqual([]);
  });
});
