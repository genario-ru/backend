export const EmailTemplateKey = {
  OTP: "otp",
  EmailVerification: "email_verification",
  UpcomingSubscriptionCharge: "upcoming_subscription_charge",
  SubscriptionPaymentFailed: "subscription_payment_failed",
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

export const UPCOMING_SUBSCRIPTION_CHARGE_SUBJECT_BY_DAYS: Record<
  1 | 3,
  string
> = {
  1: "Оплата тарифа завтра",
  3: "Оплата тарифа через 3 дня",
};
