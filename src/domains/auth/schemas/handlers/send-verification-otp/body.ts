import { z } from "@/lib/zod";

export const sendVerificationOtpBodySchema = z
  .object({
    email: z.email(),
    type: z.enum([
      "sign-in",
      "email-verification",
      "forget-password",
      "change-email",
    ]),
  })
  .meta({
    title: "Send verification OTP body",
    description: "Send verification OTP body description",
    ref: "SendVerificationOtpBodySchema",
  });

export type SendVerificationOtpBody = z.infer<
  typeof sendVerificationOtpBodySchema
>;
