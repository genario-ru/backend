import { z } from "@/lib/zod";
import { queryMetaSchema } from "@/shared/schemas/common/meta";

export const getMyCreditsUsageQuerySchema = queryMetaSchema.pick({
  page: true,
  perPage: true,
});

export type GetMyCreditsUsageQuery = z.infer<
  typeof getMyCreditsUsageQuerySchema
>;
