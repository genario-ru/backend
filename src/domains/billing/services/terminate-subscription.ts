import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { subscription } from "@/db/schema";
import type { Transaction } from "@/db/types";

type TerminateSubscriptionParams = {
  userId: string;
  subscriptionId: string;
  tx?: Transaction;
};

export async function terminateSubscription({
  userId,
  subscriptionId,
  tx: txParam,
}: TerminateSubscriptionParams) {
  const tx = txParam ?? db;
  const currentDate = new Date();

  await tx
    .update(subscription)
    .set({
      status: "terminated",
      statusUpdatedAt: currentDate.toISOString(),
    })
    .where(
      and(eq(subscription.id, subscriptionId), eq(subscription.userId, userId)),
    );
}
