import { EmailTemplateKey } from "@/domains/mail/constants/template-keys";

import {
  type EmailVerificationPayload,
  emailVerificationPayloadSchema,
} from "./email-verification";
import { type OtpEmailPayload, otpEmailPayloadSchema } from "./otp";
import {
  type UpcomingSubscriptionChargePayload,
  upcomingSubscriptionChargePayloadSchema,
} from "./upcoming-subscription-charge";

export const emailPayloadSchemas = {
  [EmailTemplateKey.OTP]: otpEmailPayloadSchema,
  [EmailTemplateKey.EmailVerification]: emailVerificationPayloadSchema,
  [EmailTemplateKey.UpcomingSubscriptionCharge]:
    upcomingSubscriptionChargePayloadSchema,
} as const;

export type EmailPayloadByKey = {
  [EmailTemplateKey.OTP]: OtpEmailPayload;
  [EmailTemplateKey.EmailVerification]: EmailVerificationPayload;
  [EmailTemplateKey.UpcomingSubscriptionCharge]: UpcomingSubscriptionChargePayload;
};

export type {
  EmailVerificationPayload,
  OtpEmailPayload,
  UpcomingSubscriptionChargePayload,
};
