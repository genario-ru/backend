import { EmailTemplateKey } from "@/domains/mail/constants/template-keys";
import { sendEmail } from "@/domains/mail/services/send-email";
import { env } from "@/env";

type SendSubscriptionPaymentFailedEmailParams = {
  tariffName: string;
  tariffPrice: number;
  userEmail: string;
  userId: string;
};

export function sendSubscriptionPaymentFailedEmail({
  tariffName,
  tariffPrice,
  userEmail,
  userId,
}: SendSubscriptionPaymentFailedEmailParams) {
  return sendEmail({
    to: userEmail,
    userId,
    templateKey: EmailTemplateKey.SubscriptionPaymentFailed,
    payload: {
      billingUrl: `${env.FRONTEND_BASE_URL}/billing`,
      tariffName,
      tariffPrice,
    },
  });
}
