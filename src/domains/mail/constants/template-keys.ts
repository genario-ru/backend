export const EmailTemplateKey = {
  OTP: "otp",
  EmailVerification: "email_verification",
} as const;

export type EmailTemplateKey =
  (typeof EmailTemplateKey)[keyof typeof EmailTemplateKey];

export const OTP_SUBJECT_BY_TYPE: Record<
  "sign-in" | "email-verification" | "forget-password" | "change-email",
  string
> = {
  "sign-in": "Код для входа",
  "email-verification": "Код подтверждения почты",
  "forget-password": "Код для восстановления пароля",
  "change-email": "Код для смены почты",
};
