import * as z from "zod";

import { metaQuerySchema } from "@/schemas/common/meta";

import { referralRegistry } from "../../registry";

export const getMyReferralInvitesQuerySchema = metaQuerySchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    sort: z.string().optional(),
  })
  .register(referralRegistry, {
    title: "Get my referral invites query",
    description: "Get my referral invites query description",
    ref: "GetMyReferralInvitesQuerySchema",
  });

export type GetMyReferralInvitesQuery = z.infer<
  typeof getMyReferralInvitesQuerySchema
>;
