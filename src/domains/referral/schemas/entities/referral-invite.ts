import { createSelectSchema } from "drizzle-zod";

import { referralInvite } from "@/db/schema";
import { userSchema } from "@/domains/auth/schemas/entities/user";
import { creditsBatchSchema } from "@/domains/credits/schemas/entities/credits-batch";
import { tariffDiscountSchema } from "@/domains/tariffs/schemas/entities/tariff-discout";
import { z } from "@/lib/zod";

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
