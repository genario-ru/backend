import { z } from "@/lib/zod";

export const otpEmailPayloadSchema = z.object({
  otp: z.string().min(4).max(12),
  type: z.enum([
    "sign-in",
    "email-verification",
    "forget-password",
    "change-email",
  ]),
});

export type OtpEmailPayload = z.infer<typeof otpEmailPayloadSchema>;
