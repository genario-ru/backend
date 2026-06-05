import { z } from "@/lib/zod";

export const triggerTerminateExpiredCreditsBatchesResponseSchema = z
  .object({
    data: z.object({
      jobId: z.string().nullable(),
    }),
  })
  .meta({
    title: "Trigger terminate expired credits batches response",
    description:
      "Trigger terminate expired credits batches response description",
    ref: "TriggerTerminateExpiredCreditsBatchesResponseSchema",
  });

export type TriggerTerminateExpiredCreditsBatchesResponse = z.infer<
  typeof triggerTerminateExpiredCreditsBatchesResponseSchema
>;
