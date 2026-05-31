import { describe, expect, it } from "vitest";

import { getNextReadyPendingSubscription } from "@/domains/billing/utils/get-next-ready-pending-subscription";

describe("getNextReadyPendingSubscription", () => {
  it("ignores pending subscriptions without startsAt and returns the nearest ready one", () => {
    const currentDate = new Date("2026-06-03T16:03:45.026Z");

    const result = getNextReadyPendingSubscription({
      currentDate,
      pendingSubscriptions: [
        { id: "without-start", startsAt: null },
        { id: "future", startsAt: "2026-06-04T16:03:45.026Z" },
        { id: "ready-later", startsAt: "2026-06-03T16:03:45.026Z" },
        { id: "ready-first", startsAt: "2026-06-02T16:03:45.026Z" },
      ] as never,
    });

    expect(result).toMatchObject({ id: "ready-first" });
  });
});
