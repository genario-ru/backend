import { createSelectSchema } from "drizzle-zod";

import { profilesFromChannelsJob } from "@/db/schemas/jobs/profiles-from-channels-job";
import type { z } from "@/lib/zod";

export const profilesFromChannelsJobSchema = createSelectSchema(
  profilesFromChannelsJob,
).meta({
  title: "Profiles from channels job",
  description: "Profiles from channels job description",
  ref: "ProfilesFromChannelsJobSchema",
});

export type ProfilesFromChannelsJob = z.infer<
  typeof profilesFromChannelsJobSchema
>;
