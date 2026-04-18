import { z } from "@/lib/zod";

export const emailVerificationPayloadSchema = z.object({
  url: z.string().url(),
  token: z.string(),
});

export type EmailVerificationPayload = z.infer<
  typeof emailVerificationPayloadSchema
>;
