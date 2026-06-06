import { eq } from "drizzle-orm";
import { partition } from "es-toolkit";

import { db } from "@/db";
import { creditsBatch, creditsUsage } from "@/db/schema";
import type { Transaction } from "@/db/types";

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
  totalTokens: number;
  tx?: Transaction;
};

export async function chargeCredits({
  userId,
  entity,
  entityId,
  totalTokens,
  tx: txParam,
}: ChargeCreditsParams) {
  const tx = txParam ?? db;
  const creditsBalance = await getCreditsBalance({ userId });
  const entityPrice = creditsPricing[entity];

  if (creditsBalance < entityPrice) {
    throw new Error(NOT_ENOUGH_CREDITS_ERROR);
  }

  // Сортируем по дате создания по возрастанию, чтобы первыми списывать самые
  // старые батчи. Для подписочных батчей это совпадает с ближайшим сроком
  // истечения (каждый новый цикл создает батч с более поздним expiresAt), что
  // предотвращает сгорание истекающих раньше кредитов.
  const foundCreditsBatches = await tx.query.creditsBatch.findMany({
    orderBy: (creditsBatch, { asc }) => asc(creditsBatch.createdAt),
    where: (creditsBatch, { and, or, eq, gte, isNull }) =>
      and(
        eq(creditsBatch.userId, userId),
        eq(creditsBatch.status, "active"),
        gte(creditsBatch.remainingAmount, entityPrice),
        or(
          isNull(creditsBatch.expiresAt),
          gte(creditsBatch.expiresAt, new Date().toISOString()),
        ),
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

  const tokensPerCredit = totalTokens / entityPrice;
  const tokensPerCreditRounded = Number(tokensPerCredit.toFixed(2));

  await tx.transaction(async (tx) => {
    // Блокируем строку выбранного батча, чтобы исключить гонку при параллельном
    // списании кредитов одного пользователя (иначе остаток может уйти в минус).
    const [lockedCreditsBatch] = await tx
      .select()
      .from(creditsBatch)
      .where(eq(creditsBatch.id, creditsBatchToCharge.id))
      .for("update");

    // Перепроверяем актуальный остаток уже под блокировкой: параллельное
    // списание могло уменьшить его, пока мы выбирали батч.
    if (
      !lockedCreditsBatch ||
      lockedCreditsBatch.status !== "active" ||
      lockedCreditsBatch.remainingAmount < entityPrice
    ) {
      throw new Error(NOT_ENOUGH_CREDITS_ERROR);
    }

    const newRemainingAmount = lockedCreditsBatch.remainingAmount - entityPrice;

    await tx
      .update(creditsBatch)
      .set({ remainingAmount: newRemainingAmount })
      .where(eq(creditsBatch.id, lockedCreditsBatch.id));

    await tx.insert(creditsUsage).values({
      userId,
      batchId: lockedCreditsBatch.id,
      entity,
      entityId,
      creditsAmount: entityPrice,
      tokensPerCredit: tokensPerCreditRounded,
    });
  });
}
