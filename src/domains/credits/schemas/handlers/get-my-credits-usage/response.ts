import { z } from "@/lib/zod";
import { responseMetaSchema } from "@/shared/schemas/common/meta";

import { creditsUsageExtendedSchema } from "../../entities/credits-usage";

export const getMyCreditsUsageResponseMetaSchema = responseMetaSchema
  .omit({
    sortBy: true,
    sortOrder: true,
  })
  .meta({
    title: "Get my credits usage response meta",
    description: "Get my credits usage response meta description",
    ref: "GetMyCreditsUsageResponseMetaSchema",
  });

export type GetMyCreditsUsageResponseMeta = z.infer<
  typeof getMyCreditsUsageResponseMetaSchema
>;

export const getMyCreditsUsageResponseSchema = z
  .object({
    data: z.array(creditsUsageExtendedSchema),
    meta: getMyCreditsUsageResponseMetaSchema,
  })
  .meta({
    title: "Get my credits usage response",
    description: "Get my credits usage response description",
    ref: "GetMyCreditsUsageResponseSchema",
  });

export type GetMyCreditsUsageResponse = z.infer<
  typeof getMyCreditsUsageResponseSchema
>;
