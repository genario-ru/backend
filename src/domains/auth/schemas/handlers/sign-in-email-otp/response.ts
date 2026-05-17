import { userSchema } from "@/domains/auth/schemas/entities/user";
import { z } from "@/lib/zod";

export const signInEmailOtpResponseSchema = z
  .object({
    token: z.string(),
    user: userSchema,
  })
  .meta({
    title: "Sign in with email OTP response",
    description: "Sign in with email OTP response description",
    ref: "SignInEmailOtpResponseSchema",
  });

export type SignInEmailOtpResponse = z.infer<
  typeof signInEmailOtpResponseSchema
>;
