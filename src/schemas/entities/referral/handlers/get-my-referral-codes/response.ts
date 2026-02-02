import * as z from "zod";

import { referralCodeExtendedSchema } from "../../entities/referral-code";
import { referralRegistry } from "../../registry";

export const getMyReferralCodesResponseSchema = z
  .object({
    data: z.object({
      referralCodes: z.array(referralCodeExtendedSchema.omit({ user: true })),
    }),
  })
  .register(referralRegistry, {
    title: "Get my referral codes response",
    description: "Get my referral codes response description",
    ref: "GetMyReferralCodesResponseSchema",
  });

export type GetMyReferralCodesResponse = z.infer<
  typeof getMyReferralCodesResponseSchema
>;
