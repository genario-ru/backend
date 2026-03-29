import { z } from "@/lib/zod";

import { creditsBatchExtendedSchema } from "../../entities/credits-batch";

export const getMyCreditsBatchesResponseSchema = z
  .object({
    data: z.array(creditsBatchExtendedSchema),
  })
  .meta({
    title: "Get my credits batches response",
    description: "Get my credits batches response description",
    ref: "GetMyCreditsBatchesResponseSchema",
  });

export type GetMyCreditsBatchesResponse = z.infer<
  typeof getMyCreditsBatchesResponseSchema
>;
