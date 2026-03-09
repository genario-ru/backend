import { z } from "@/lib/zod";
import { metaResponseSchema } from "@/schemas/common/meta";

import { referralInviteExtendedSchema } from "../../entities/referral-invite";
import { referralRegistry } from "../../registry";

export const getMyReferralInvitesResponseSchema = z
  .object({
    data: z.array(referralInviteExtendedSchema),
    meta: metaResponseSchema.omit({ sortBy: true, sortOrder: true }).extend({
      sort: z.string(),
    }),
  })
  .register(referralRegistry, {
    title: "Get my referral invites response",
    description: "Get my referral invites response description",
    ref: "GetMyReferralInvitesResponseSchema",
  });

export type GetMyReferralInvitesResponse = z.infer<
  typeof getMyReferralInvitesResponseSchema
>;
