import { z } from "@/lib/zod";

import { referralRegistry } from "../../registry";

export const getReferralInfoResponseSchema = z
  .object({
    data: z.object({
      referralBasicInfo: z.string(),
      referralDocumentLink: z.string(),
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
