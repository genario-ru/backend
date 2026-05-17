import { z } from "@/lib/zod";

export const sendVerificationOtpResponseSchema = z
  .object({
    success: z.boolean().optional(),
  })
  .meta({
    title: "Send verification OTP response",
    description: "Send verification OTP response description",
    ref: "SendVerificationOtpResponseSchema",
  });

export type SendVerificationOtpResponse = z.infer<
  typeof sendVerificationOtpResponseSchema
>;
