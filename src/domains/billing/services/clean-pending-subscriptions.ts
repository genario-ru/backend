import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { subscription } from "@/db/schema";
import type { Transaction } from "@/db/types";

type CleanPendingSubscriptionsParams = {
  userId: string;
  exceptForSubscriptionIds?: string[];
  tx?: Transaction;
};

export async function cleanPendingSubscriptions({
  userId,
  exceptForSubscriptionIds = [],
  tx: txParam,
}: CleanPendingSubscriptionsParams) {
  const tx = txParam ?? db;

  const foundPendingSubscriptions = await tx.query.subscription.findMany({
    where: (subscription, { and, eq, notInArray }) =>
      and(
        eq(subscription.userId, userId),
        eq(subscription.status, "pending"),
        notInArray(subscription.id, exceptForSubscriptionIds),
      ),
  });

  if (!foundPendingSubscriptions.length) {
    return;
  }

  await tx.delete(subscription).where(
    and(
      inArray(
        subscription.id,
        foundPendingSubscriptions.map((subscription) => subscription.id),
      ),
      eq(subscription.userId, userId),
    ),
  );
}
