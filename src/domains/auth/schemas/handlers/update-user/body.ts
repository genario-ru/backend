import { z } from "@/lib/zod";

export const updateUserBodySchema = z
  .object({
    name: z.string().min(1).optional(),
    image: z.string().optional(),
    hideOnboarding: z.boolean().optional(),
  })
  .meta({
    title: "Update user body",
    description: "Update user body description",
    ref: "UpdateUserBodySchema",
  });

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
