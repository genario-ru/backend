import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { profileType } from "@/db/schema";

export const profileTypeSchema = createSelectSchema(profileType).meta({
  title: "Profile type",
  description: "Profile type description",
  ref: "ProfileTypeSchema",
});

export type ProfileType = z.infer<typeof profileTypeSchema>;
