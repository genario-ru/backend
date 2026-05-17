import { z } from "@/lib/zod";

export const deleteUserBodySchema = z
  .object({
    callbackURL: z.url().optional(),
    password: z.string().optional(),
    token: z.string().optional(),
  })
  .meta({
    title: "Delete user body",
    description: "Delete user body description",
    ref: "DeleteUserBodySchema",
  });

export type DeleteUserBody = z.infer<typeof deleteUserBodySchema>;
