import { z } from "@/lib/zod";
import { responseMetaSchema } from "@/schemas/shared/common/meta";

import { referralInviteExtendedSchema } from "../../entities/referral-invite";

export const getMyReferralInvitesResponseMetaSchema = responseMetaSchema
  .omit({ sortBy: true, sortOrder: true })
  .extend({
    sort: z.string(),
  })
  .meta({
    title: "Get my referral invites response meta schema",
    description: "Get my referral invites response meta schema description",
    ref: "GetMyReferralInvitesResponseMetaSchema",
  });

export type GetMyReferralInvitesResponseMeta = z.infer<
  typeof getMyReferralInvitesResponseMetaSchema
>;

export const getMyReferralInvitesResponseSchema = z
  .object({
    data: z.array(referralInviteExtendedSchema),
    meta: getMyReferralInvitesResponseMetaSchema,
  })
  .meta({
    title: "Get my referral invites response",
    description: "Get my referral invites response description",
    ref: "GetMyReferralInvitesResponseSchema",
  });

export type GetMyReferralInvitesResponse = z.infer<
  typeof getMyReferralInvitesResponseSchema
>;
