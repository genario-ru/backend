import { EmailTemplateKey } from "@/domains/mail/constants/template-keys";

import {
  type EmailVerificationPayload,
  emailVerificationPayloadSchema,
} from "./email-verification";
import { type OtpEmailPayload, otpEmailPayloadSchema } from "./otp";
import {
  type SubscriptionPaymentFailedPayload,
  subscriptionPaymentFailedPayloadSchema,
} from "./subscription-payment-failed";
import {
  type UpcomingSubscriptionChargePayload,
  upcomingSubscriptionChargePayloadSchema,
} from "./upcoming-subscription-charge";

export const emailPayloadSchemas = {
  [EmailTemplateKey.OTP]: otpEmailPayloadSchema,
  [EmailTemplateKey.EmailVerification]: emailVerificationPayloadSchema,
  [EmailTemplateKey.UpcomingSubscriptionCharge]:
    upcomingSubscriptionChargePayloadSchema,
  [EmailTemplateKey.SubscriptionPaymentFailed]:
    subscriptionPaymentFailedPayloadSchema,
} as const;

export type EmailPayloadByKey = {
  [EmailTemplateKey.OTP]: OtpEmailPayload;
  [EmailTemplateKey.EmailVerification]: EmailVerificationPayload;
  [EmailTemplateKey.UpcomingSubscriptionCharge]: UpcomingSubscriptionChargePayload;
  [EmailTemplateKey.SubscriptionPaymentFailed]: SubscriptionPaymentFailedPayload;
};

export type {
  EmailVerificationPayload,
  OtpEmailPayload,
  SubscriptionPaymentFailedPayload,
  UpcomingSubscriptionChargePayload,
};
