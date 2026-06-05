import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { creditsBatch, subscriptionToCreditsBatch } from "@/db/schema";
import type { Transaction } from "@/db/types";

type TerminateExpiredCreditsBatchesParams = {
  subscriptionId?: string;
  tx?: Transaction;
};

export async function terminateExpiredCreditsBatches({
  subscriptionId,
  tx: txParam,
}: TerminateExpiredCreditsBatchesParams = {}) {
  const tx = txParam ?? db;
  const whereConditions = [];

  if (subscriptionId) {
    whereConditions.push(
      eq(subscriptionToCreditsBatch.subscriptionId, subscriptionId),
    );
  }

  const foundSubscriptionActiveCreditsBatches =
    await db.query.subscriptionToCreditsBatch.findMany({
      where: and(...whereConditions),
      with: {
        creditsBatch: true,
      },
    });

  const creditsBatchesIdsToTerminate = foundSubscriptionActiveCreditsBatches
    .filter((subscriptionToCreditsBatch) => {
      const isActive =
        subscriptionToCreditsBatch.creditsBatch.status === "active";

      const expiresAt = subscriptionToCreditsBatch.creditsBatch.expiresAt
        ? new Date(subscriptionToCreditsBatch.creditsBatch.expiresAt)
        : null;

      const currentDate = new Date();
      const isExpired = expiresAt && expiresAt < currentDate;

      return isActive && isExpired;
    })
    .map(
      (subscriptionToCreditsBatch) =>
        subscriptionToCreditsBatch.creditsBatch.id,
    );

  const terminatedCreditsBatches = await tx
    .update(creditsBatch)
    .set({ status: "terminated" })
    .where(inArray(creditsBatch.id, creditsBatchesIdsToTerminate))
    .returning();

  return terminatedCreditsBatches;
}
