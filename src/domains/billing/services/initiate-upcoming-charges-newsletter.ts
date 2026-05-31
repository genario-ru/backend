import { db } from "@/db";
import { EmailTemplateKey } from "@/domains/mail/constants/template-keys";
import { sendEmail } from "@/domains/mail/services/send-email";

import { getUpcomingChargeNoticeDays } from "../utils/get-upcoming-charge-notice-days";
import { getUpcomingSubscriptionCharge } from "../utils/get-upcoming-subscription-charge";
import { hasUpcomingChargeEmailBeenSentToday } from "./has-upcoming-charge-email-been-sent-today";

export async function initiateUpcomingChargesNewsletter() {
  const currentDate = new Date();

  const foundUsersWithSubscriptions = await db.query.user.findMany({
    with: {
      subscriptions: {
        orderBy: (subscription, { desc }) => desc(subscription.createdAt),
        where: (subscription, { inArray }) =>
          inArray(subscription.status, ["pending", "active"]),
        with: {
          tariff: true,
        },
      },
    },
  });

  for (const foundUser of foundUsersWithSubscriptions) {
    const hasNoSubscriptions = foundUser.subscriptions.length === 0;

    if (hasNoSubscriptions) {
      continue;
    }

    const upcomingSubscriptionCharge = getUpcomingSubscriptionCharge({
      subscriptions: foundUser.subscriptions,
    });

    if (!upcomingSubscriptionCharge) {
      continue;
    }

    const daysBeforeCharge = getUpcomingChargeNoticeDays({
      chargeAt: upcomingSubscriptionCharge.chargeAt,
      currentDate,
    });

    if (!daysBeforeCharge) {
      continue;
    }

    const emailHasBeenSentToday = await hasUpcomingChargeEmailBeenSentToday({
      currentDate,
      userId: foundUser.id,
    });

    if (emailHasBeenSentToday) {
      continue;
    }

    await sendEmail({
      to: foundUser.email,
      userId: foundUser.id,
      templateKey: EmailTemplateKey.UpcomingSubscriptionCharge,
      payload: {
        chargeAt: upcomingSubscriptionCharge.chargeAt,
        daysBeforeCharge,
        tariffName: upcomingSubscriptionCharge.tariffName,
        tariffPrice: upcomingSubscriptionCharge.tariffPrice,
      },
    });
  }
}
