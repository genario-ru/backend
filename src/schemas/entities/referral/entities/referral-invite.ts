import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { referralInvite } from "@/db/schema";

import { creditsBatchSchema } from "../../billing/entities/credits-batch";
import { planDiscountSchema } from "../../billing/entities/plan-discount";
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
    planDiscount: planDiscountSchema.nullish(),
  })
  .register(referralRegistry, {
    title: "Referral invite extended",
    description: "Referral invite extended description",
    ref: "ReferralInviteExtendedSchema",
  });
