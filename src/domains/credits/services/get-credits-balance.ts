import { db } from "@/db";

type GetCreditsBalanceParams = {
  userId: string;
};

export async function getCreditsBalance({ userId }: GetCreditsBalanceParams) {
  const foundCreditsBatches = await db.query.creditsBatch.findMany({
    where: (creditsBatch, { and, eq }) =>
      and(eq(creditsBatch.userId, userId), eq(creditsBatch.status, "active")),
  });

  const creditsBalance = foundCreditsBatches.reduce((acc, creditsBatch) => {
    return acc + creditsBatch.remainingAmount;
  }, 0);

  return creditsBalance;
}
