import { createSelectSchema } from "drizzle-zod";

import { referralReward } from "@/db/schema";
import { z } from "@/lib/zod";

export const referralRewardSchema = createSelectSchema(referralReward).meta({
  title: "Referral reward",
  description: "Referral reward description",
  ref: "ReferralRewardSchema",
});

export type ReferralReward = z.infer<typeof referralRewardSchema>;
