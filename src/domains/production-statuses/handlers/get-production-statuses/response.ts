import { productionStatusSchema } from "@/domains/production-statuses/entities/production-status";
import { z } from "@/lib/zod";

export const getProductionStatusesResponseSchema = z
  .object({
    data: z.array(productionStatusSchema),
  })
  .meta({
    title: "Get production statuses response",
    description: "Get production statuses response description",
    ref: "GetProductionStatusesResponseSchema",
  });

export type GetProductionStatusesResponse = z.infer<
  typeof getProductionStatusesResponseSchema
>;
