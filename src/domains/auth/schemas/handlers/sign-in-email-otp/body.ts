import { z } from "@/lib/zod";

export const signInEmailOtpBodySchema = z
  .object({
    email: z.email(),
    otp: z.string().length(6),
    isMarketingAccepted: z.boolean().optional(),
  })
  .meta({
    title: "Sign in with email OTP body",
    description: "Sign in with email OTP body description",
    ref: "SignInEmailOtpBodySchema",
  });

export type SignInEmailOtpBody = z.infer<typeof signInEmailOtpBodySchema>;
