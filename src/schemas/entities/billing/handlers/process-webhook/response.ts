import { z } from "@/lib/zod";

export const processWebhookResponseSchema = z
  .object({
    success: z.boolean(),
  })
  .meta({
    title: "Process webhook response",
    description: "Process webhook response description",
    ref: "ProcessWebhookResponseSchema",
  });

export type ProcessWebhookResponse = z.infer<
  typeof processWebhookResponseSchema
>;
