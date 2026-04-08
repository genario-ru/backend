import { eq } from "drizzle-orm";
import { partition } from "es-toolkit";

import { db } from "@/db";
import { creditsBatch, creditsUsage } from "@/db/schema";

import { creditsPricing } from "../constants/credits-pricing";
import type { CreditsBatch } from "../schemas/entities/credits-batch";
import type { CreditsPricingEntity } from "../types/credits-pricing";
import { getCreditsBalance } from "./get-credits-balance";

const NOT_ENOUGH_CREDITS_ERROR =
  "Недостаточно кредитов для выполнения операции";

type ChargeCreditsParams = {
  userId: string;
  entity: CreditsPricingEntity;
  entityId: string;
  totalPrice: number;
};

export async function chargeCredits({
  userId,
  entity,
  entityId,
  totalPrice,
}: ChargeCreditsParams) {
  const creditsBalance = await getCreditsBalance({ userId });
  const entityPrice = creditsPricing[entity];

  if (creditsBalance < entityPrice) {
    throw new Error(NOT_ENOUGH_CREDITS_ERROR);
  }

  const foundCreditsBatches = await db.query.creditsBatch.findMany({
    orderBy: (creditsBatch, { desc }) => desc(creditsBatch.createdAt),
    where: (creditsBatch, { and, eq, gt, gte }) =>
      and(
        eq(creditsBatch.userId, userId),
        eq(creditsBatch.status, "active"),
        gt(creditsBatch.remainingAmount, entityPrice),
        gte(creditsBatch.expiresAt, new Date().toISOString()),
      ),
    with: {
      subscriptionToCreditsBatch: true,
    },
  });

  if (foundCreditsBatches.length === 0) {
    throw new Error(NOT_ENOUGH_CREDITS_ERROR);
  }

  const [subscriptionCreditsBatches, creditsPackagesCreditsBatches] = partition(
    foundCreditsBatches,
    (creditsBatch) => {
      if (creditsBatch.subscriptionToCreditsBatch) {
        return true;
      }

      return false;
    },
  );

  let creditsBatchToCharge: CreditsBatch | null = null;

  if (subscriptionCreditsBatches.length > 0) {
    creditsBatchToCharge = subscriptionCreditsBatches[0];
  } else if (creditsPackagesCreditsBatches.length > 0) {
    creditsBatchToCharge = creditsPackagesCreditsBatches[0];
  } else {
    throw new Error(NOT_ENOUGH_CREDITS_ERROR);
  }

  const newRemainingAmount = creditsBatchToCharge.remainingAmount - entityPrice;
  const creditPrice = totalPrice / entityPrice;
  const creditPriceRounded = Number(creditPrice.toFixed(2));

  await db.transaction(async (tx) => {
    await tx
      .update(creditsBatch)
      .set({ remainingAmount: newRemainingAmount })
      .where(eq(creditsBatch.id, creditsBatchToCharge.id));

    await tx.insert(creditsUsage).values({
      userId,
      batchId: creditsBatchToCharge.id,
      entity,
      entityId,
      creditsAmount: entityPrice,
      creditPrice: creditPriceRounded,
      totalPrice,
    });
  });
}
