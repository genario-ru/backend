import { createSelectSchema } from "drizzle-zod";

import { referralCode } from "@/db/schema";
import { z } from "@/lib/zod";

import { userSchema } from "../../users/entities/user";
import { referralRegistry } from "../registry";
import { referralRewardSchema } from "./referral-reward";

export const referralCodeSchema = createSelectSchema(referralCode).register(
  referralRegistry,
  {
    title: "Referral code",
    description: "Referral code description",
    ref: "ReferralCodeSchema",
  },
);

export type ReferralCode = z.infer<typeof referralCodeSchema>;

export const referralCodeExtendedSchema = referralCodeSchema
  .extend({
    user: userSchema,
    referralReward: referralRewardSchema,
  })
  .register(referralRegistry, {
    title: "Referral code extended",
    description: "Referral code extended description",
    ref: "ReferralCodeExtendedSchema",
  });
