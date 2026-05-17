import { z } from "@/lib/zod";

export const changeEmailBodySchema = z
  .object({
    newEmail: z.email(),
    callbackURL: z.url().optional(),
  })
  .meta({
    title: "Change email body",
    description: "Change email body description",
    ref: "ChangeEmailBodySchema",
  });

export type ChangeEmailBody = z.infer<typeof changeEmailBodySchema>;
