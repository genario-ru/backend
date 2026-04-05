import { z } from "@/lib/zod";
import { queryMetaSchema } from "@/schemas/shared/common/meta";

export const getMyReferralInvitesQuerySchema = queryMetaSchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    sort: z.string().optional(),
  });

export type GetMyReferralInvitesQuery = z.infer<
  typeof getMyReferralInvitesQuerySchema
>;
