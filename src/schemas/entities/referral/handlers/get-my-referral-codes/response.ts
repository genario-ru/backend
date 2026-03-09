import { z } from "@/lib/zod";

import { referralCodeExtendedSchema } from "../../entities/referral-code";
export const getMyReferralCodesResponseSchema = z
  .object({
    data: z.object({
      referralCodes: z.array(referralCodeExtendedSchema.omit({ user: true })),
    }),
  })
  .meta({
    title: "Get my referral codes response",
    description: "Get my referral codes response description",
    ref: "GetMyReferralCodesResponseSchema",
  });

export type GetMyReferralCodesResponse = z.infer<
  typeof getMyReferralCodesResponseSchema
>;
