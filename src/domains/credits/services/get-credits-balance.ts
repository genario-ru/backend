import { db } from "@/db";

type GetCreditsBalanceParams = {
  userId: string;
};

export async function getCreditsBalance({ userId }: GetCreditsBalanceParams) {
  const foundCreditsBatches = await db.query.creditsBatch.findMany({
    where: (creditsBatch, { and, or, eq, isNull, gte }) =>
      and(
        eq(creditsBatch.userId, userId),
        eq(creditsBatch.status, "active"),
        or(
          isNull(creditsBatch.expiresAt),
          gte(creditsBatch.expiresAt, new Date().toISOString()),
        ),
      ),
  });

  const creditsBalance = foundCreditsBatches.reduce((acc, creditsBatch) => {
    return acc + creditsBatch.remainingAmount;
  }, 0);

  return creditsBalance;
}
