import { z } from "@/lib/zod";

export const updateUserResponseSchema = z
  .object({
    status: z.boolean().optional(),
  })
  .meta({
    title: "Update user response",
    description: "Update user response description",
    ref: "UpdateUserResponseSchema",
  });

export type UpdateUserResponse = z.infer<typeof updateUserResponseSchema>;
