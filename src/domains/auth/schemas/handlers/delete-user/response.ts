import { z } from "@/lib/zod";

export const deleteUserResponseMessageSchema = z.enum(["User deleted"]);

export const deleteUserResponseSchema = z
  .object({
    success: z.boolean(),
    message: deleteUserResponseMessageSchema,
  })
  .meta({
    title: "Delete user response",
    description: "Delete user response description",
    ref: "DeleteUserResponseSchema",
  });

export type DeleteUserResponse = z.infer<typeof deleteUserResponseSchema>;
