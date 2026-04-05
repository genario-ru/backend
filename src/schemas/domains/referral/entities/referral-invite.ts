import { createSelectSchema } from "drizzle-zod";

import { referralInvite } from "@/db/schema";
import { z } from "@/lib/zod";

import { creditsBatchSchema } from "../../credits/entities/credits-batch";
import { tariffDiscountSchema } from "../../tariffs/entities/tariff-discout";
import { userSchema } from "../../users/entities/user";
import { referralCodeSchema } from "./referral-code";

export const referralInviteSchema = createSelectSchema(referralInvite).meta({
  title: "Referral invite",
  description: "Referral invite description",
  ref: "ReferralInviteSchema",
});

export type ReferralInvite = z.infer<typeof referralInviteSchema>;

export const referralInviteExtendedSchema = referralInviteSchema
  .extend({
    referralSourceUser: userSchema,
    referralTargetUser: userSchema,
    referralCode: referralCodeSchema,
    creditsBatch: creditsBatchSchema.nullish(),
    tariffDiscount: tariffDiscountSchema.nullish(),
  })
  .meta({
    title: "Referral invite extended",
    description: "Referral invite extended description",
    ref: "ReferralInviteExtendedSchema",
  });
