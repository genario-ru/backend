import { z } from "@/lib/zod";

export const signOutResponseSchema = z
  .object({
    success: z.boolean().optional(),
  })
  .meta({
    title: "Sign out response",
    description: "Sign out response description",
    ref: "SignOutResponseSchema",
  });

export type SignOutResponse = z.infer<typeof signOutResponseSchema>;
