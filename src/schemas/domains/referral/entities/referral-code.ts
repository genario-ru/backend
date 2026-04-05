import { createSelectSchema } from "drizzle-zod";

import { referralCode } from "@/db/schema";
import { z } from "@/lib/zod";

import { userSchema } from "../../users/entities/user";
import { referralRewardSchema } from "./referral-reward";

export const referralCodeSchema = createSelectSchema(referralCode).meta({
  title: "Referral code",
  description: "Referral code description",
  ref: "ReferralCodeSchema",
});

export type ReferralCode = z.infer<typeof referralCodeSchema>;

export const referralCodeExtendedSchema = referralCodeSchema
  .extend({
    user: userSchema,
    referralReward: referralRewardSchema,
  })
  .meta({
    title: "Referral code extended",
    description: "Referral code extended description",
    ref: "ReferralCodeExtendedSchema",
  });
