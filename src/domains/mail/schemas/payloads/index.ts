import { EmailTemplateKey } from "@/domains/mail/constants/template-keys";

import {
  type EmailVerificationPayload,
  emailVerificationPayloadSchema,
} from "./email-verification";
import { type OtpEmailPayload, otpEmailPayloadSchema } from "./otp";

export const emailPayloadSchemas = {
  [EmailTemplateKey.OTP]: otpEmailPayloadSchema,
  [EmailTemplateKey.EmailVerification]: emailVerificationPayloadSchema,
} as const;

export type EmailPayloadByKey = {
  [EmailTemplateKey.OTP]: OtpEmailPayload;
  [EmailTemplateKey.EmailVerification]: EmailVerificationPayload;
};

export type { EmailVerificationPayload, OtpEmailPayload };
