import { z } from "@/lib/zod";

import { productFeatureSchema } from "../../entities/product-feature";

export const getProductFeaturesResponseSchema = z
  .object({
    data: z.array(productFeatureSchema),
  })
  .meta({
    title: "Get product features response",
    description: "Get product features response description",
    ref: "GetProductFeaturesResponseSchema",
  });

export type GetProductFeaturesResponse = z.infer<
  typeof getProductFeaturesResponseSchema
>;
