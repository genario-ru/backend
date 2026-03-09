import { z } from "@/lib/zod";
import { queryMetaSchema } from "@/schemas/common/meta";

export const getMyReferralInvitesQuerySchema = queryMetaSchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    sort: z.string().optional(),
  })
  .meta({
    title: "Get my referral invites query",
    description: "Get my referral invites query description",
    ref: "GetMyReferralInvitesQuerySchema",
  });

export type GetMyReferralInvitesQuery = z.infer<
  typeof getMyReferralInvitesQuerySchema
>;
