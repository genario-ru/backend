import { createSelectSchema } from "drizzle-zod";

import { profileType } from "@/db/schema";
import { z } from "@/lib/zod";

export const profileTypeSchema = createSelectSchema(profileType).meta({
  title: "Profile type",
  description: "Profile type description",
  ref: "ProfileTypeSchema",
});

export type ProfileType = z.infer<typeof profileTypeSchema>;
