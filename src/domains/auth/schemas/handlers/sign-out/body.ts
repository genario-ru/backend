import { z } from "@/lib/zod";

export const signOutBodySchema = z.object({}).meta({
  title: "Sign out body",
  description: "Sign out body description",
  ref: "SignOutBodySchema",
});

export type SignOutBody = z.infer<typeof signOutBodySchema>;
