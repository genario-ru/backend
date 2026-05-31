import { differenceInCalendarDays } from "date-fns";

export const UPCOMING_CHARGE_NOTICE_DAYS = [3, 1] as const;

export type UpcomingChargeNoticeDays =
  (typeof UPCOMING_CHARGE_NOTICE_DAYS)[number];

type GetUpcomingChargeNoticeDaysParams = {
  chargeAt: string;
  currentDate: Date;
};

export function getUpcomingChargeNoticeDays({
  chargeAt,
  currentDate,
}: GetUpcomingChargeNoticeDaysParams): UpcomingChargeNoticeDays | undefined {
  const chargeAtDate = new Date(chargeAt);
  const daysUntilCharge = differenceInCalendarDays(chargeAtDate, currentDate);

  const matchedNoticeDays = UPCOMING_CHARGE_NOTICE_DAYS.find(
    (noticeDays) => noticeDays === daysUntilCharge,
  );

  return matchedNoticeDays;
}
