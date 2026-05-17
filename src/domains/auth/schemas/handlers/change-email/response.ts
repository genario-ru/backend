import { z } from "@/lib/zod";

export const changeEmailResponseMessageSchema = z.enum([
  "Email updated",
  "Verification email sent",
]);

export const changeEmailResponseSchema = z
  .object({
    status: z.boolean(),
    message: changeEmailResponseMessageSchema.nullable().optional(),
  })
  .meta({
    title: "Change email response",
    description: "Change email response description",
    ref: "ChangeEmailResponseSchema",
  });

export type ChangeEmailResponse = z.infer<typeof changeEmailResponseSchema>;
