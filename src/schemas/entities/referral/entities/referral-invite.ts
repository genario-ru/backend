import { createSelectSchema } from "drizzle-zod";

import { referralInvite } from "@/db/schema";
import { z } from "@/lib/zod";

import { creditsBatchSchema } from "../../credits/entities/credits-batch";
import { tariffDiscountSchema } from "../../tariffs/entities/tariff-discout";
import { userSchema } from "../../users/entities/user";
import { referralRegistry } from "../registry";
import { referralCodeSchema } from "./referral-code";

export const referralInviteSchema = createSelectSchema(referralInvite).register(
  referralRegistry,
  {
    title: "Referral invite",
    description: "Referral invite description",
    ref: "ReferralInviteSchema",
  },
);

export type ReferralInvite = z.infer<typeof referralInviteSchema>;

export const referralInviteExtendedSchema = referralInviteSchema
  .extend({
    referralSourceUser: userSchema,
    referralTargetUser: userSchema,
    referralCode: referralCodeSchema,
    creditsBatch: creditsBatchSchema.nullish(),
    tariffDiscount: tariffDiscountSchema.nullish(),
  })
  .register(referralRegistry, {
    title: "Referral invite extended",
    description: "Referral invite extended description",
    ref: "ReferralInviteExtendedSchema",
  });
