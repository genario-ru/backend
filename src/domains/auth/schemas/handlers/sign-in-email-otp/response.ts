import { z } from "@/lib/zod";

import { userSchema } from "../../entities/user";

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
