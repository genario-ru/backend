import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { EmailTemplateKey } from "@/domains/mail/constants/template-keys";

const mocks = vi.hoisted(() => {
  const sendEmail = vi.fn();
  const db = {
    query: {
      emailLog: {
        findFirst: vi.fn(),
      },
      user: {
        findMany: vi.fn(),
      },
    },
  };

  return { db, sendEmail };
});

vi.mock("@/db", () => ({
  db: mocks.db,
}));

vi.mock("@/domains/mail/services/send-email", () => ({
  sendEmail: mocks.sendEmail,
}));

const { initiateUpcomingChargesNewsletter } =
  await import("@/domains/billing/services/initiate-upcoming-charges-newsletter");

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-06-01T12:00:00.000Z"));
  vi.clearAllMocks();
  mocks.db.query.emailLog.findFirst.mockResolvedValue(null);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("initiateUpcomingChargesNewsletter", () => {
  it("sends an email 3 days before renewable subscription charge", async () => {
    mocks.db.query.user.findMany.mockResolvedValue([
      {
        id: "user-id",
        email: "user@example.test",
        subscriptions: [
          {
            id: "subscription-id",
            status: "active",
            nextBillingAt: "2026-06-04T09:00:00.000Z",
            tariff: {
              isRenewable: true,
              name: "Базовый",
              price: 790,
            },
          },
        ],
      },
    ]);

    await initiateUpcomingChargesNewsletter();

    expect(mocks.sendEmail).toHaveBeenCalledWith({
      to: "user@example.test",
      userId: "user-id",
      templateKey: EmailTemplateKey.UpcomingSubscriptionCharge,
      payload: {
        chargeAt: "2026-06-04T09:00:00.000Z",
        daysBeforeCharge: 3,
        tariffName: "Базовый",
        tariffPrice: 790,
      },
    });
  });

  it("uses next pending subscription date after active trial", async () => {
    mocks.db.query.user.findMany.mockResolvedValue([
      {
        id: "user-id",
        email: "user@example.test",
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
            id: "next-subscription-id",
            status: "pending",
            startsAt: "2026-06-02T09:00:00.000Z",
            nextBillingAt: "2026-06-02T09:00:00.000Z",
            tariff: {
              isRenewable: true,
              name: "Базовый",
              price: 790,
            },
          },
        ],
      },
    ]);

    await initiateUpcomingChargesNewsletter();

    expect(mocks.sendEmail).toHaveBeenCalledWith({
      to: "user@example.test",
      userId: "user-id",
      templateKey: EmailTemplateKey.UpcomingSubscriptionCharge,
      payload: {
        chargeAt: "2026-06-02T09:00:00.000Z",
        daysBeforeCharge: 1,
        tariffName: "Базовый",
        tariffPrice: 790,
      },
    });
  });

  it("does not send duplicate upcoming charge email in the same day", async () => {
    mocks.db.query.emailLog.findFirst.mockResolvedValue({
      id: "email-log-id",
    });

    mocks.db.query.user.findMany.mockResolvedValue([
      {
        id: "user-id",
        email: "user@example.test",
        subscriptions: [
          {
            id: "subscription-id",
            status: "active",
            nextBillingAt: "2026-06-04T09:00:00.000Z",
            tariff: {
              isRenewable: true,
              name: "Базовый",
              price: 790,
            },
          },
        ],
      },
    ]);

    await initiateUpcomingChargesNewsletter();

    expect(mocks.sendEmail).not.toHaveBeenCalled();
  });
});
