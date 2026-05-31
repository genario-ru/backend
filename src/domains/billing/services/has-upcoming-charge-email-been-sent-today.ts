import { addDays, startOfDay } from "date-fns";

import { db } from "@/db";
import { EmailTemplateKey } from "@/domains/mail/constants/template-keys";

type HasUpcomingChargeEmailBeenSentTodayParams = {
  currentDate: Date;
  userId: string;
};

export async function hasUpcomingChargeEmailBeenSentToday({
  currentDate,
  userId,
}: HasUpcomingChargeEmailBeenSentTodayParams) {
  const currentDayStartsAt = startOfDay(currentDate);
  const nextDayStartsAt = addDays(currentDayStartsAt, 1);

  const foundEmailLog = await db.query.emailLog.findFirst({
    where: (emailLog, { and, eq, gte, lt }) =>
      and(
        eq(emailLog.userId, userId),
        eq(emailLog.templateKey, EmailTemplateKey.UpcomingSubscriptionCharge),
        gte(emailLog.createdAt, currentDayStartsAt.toISOString()),
        lt(emailLog.createdAt, nextDayStartsAt.toISOString()),
      ),
  });

  return Boolean(foundEmailLog);
}
