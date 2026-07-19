import { createSelectSchema } from "drizzle-zod";

import { profile } from "@/db/schema";
import { platformSchema } from "@/domains/platforms/schemas/entities/platform";
import { z } from "@/lib/zod";

import { profileTypeSchema } from "./profile-type";

export const profileSchema = createSelectSchema(profile).meta({
  title: "Profile",
  description: "Profile description",
  ref: "ProfileSchema",
});

export type Profile = z.infer<typeof profileSchema>;

export const profileExtendedSchema = profileSchema
  .extend({
    type: profileTypeSchema.nullable(),
    platforms: z.array(platformSchema),
  })
  .meta({
    title: "Profile extended",
    description: "Profile extended description",
    ref: "ProfileExtendedSchema",
  });

export type ProfileExtended = z.infer<typeof profileExtendedSchema>;
