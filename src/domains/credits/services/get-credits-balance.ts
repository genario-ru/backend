import { db } from "@/db";

type GetCreditsBalanceParams = {
  userId: string;
};

export async function getCreditsBalance({ userId }: GetCreditsBalanceParams) {
  // Учитываем только статус батча: истекшие батчи переводит в "terminated"
  // биллинговый cron, поэтому дату протухания здесь не проверяем.
  const foundCreditsBatches = await db.query.creditsBatch.findMany({
    where: (creditsBatch, { and, eq }) =>
      and(eq(creditsBatch.userId, userId), eq(creditsBatch.status, "active")),
  });

  const creditsBalance = foundCreditsBatches.reduce((acc, creditsBatch) => {
    return acc + creditsBatch.remainingAmount;
  }, 0);

  return creditsBalance;
}
