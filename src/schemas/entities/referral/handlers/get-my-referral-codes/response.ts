import * as z from "zod";

import { referralCodeSchema } from "../../entities/referral-code";
import { referralRewardSchema } from "../../entities/referral-reward";
import { referralRegistry } from "../../registry";

export const getReferralInfoResponseSchema = z
  .object({
    data: z.object({
      referralRewards: z.array(referralRewardSchema),
      referralCodes: z.array(
        referralCodeSchema.extend({
          referralUrl: z.string(),
        }),
      ),
    }),
  })
  .register(referralRegistry, {
    title: "Get referral info response",
    description: "Get referral info response description",
    ref: "GetReferralInfoResponseSchema",
  });

export type GetReferralInfoResponse = z.infer<
  typeof getReferralInfoResponseSchema
>;
