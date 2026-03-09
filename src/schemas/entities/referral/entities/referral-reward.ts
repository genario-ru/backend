import { createSelectSchema } from "drizzle-zod";

import { referralReward } from "@/db/schema";
import { z } from "@/lib/zod";

import { referralRegistry } from "../registry";

export const referralRewardSchema = createSelectSchema(referralReward).register(
  referralRegistry,
  {
    title: "Referral reward",
    description: "Referral reward description",
    ref: "ReferralRewardSchema",
  },
);

export type ReferralReward = z.infer<typeof referralRewardSchema>;
