import { createSelectSchema } from "drizzle-zod";

import { profile } from "@/db/schema";
import { userSchema } from "@/domains/auth/schemas/entities/user";
import { platformSchema } from "@/domains/platforms/schemas/entities/platform";
import { toneSchema } from "@/domains/tones/schemas/entities/tone";
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
    user: userSchema,
    type: profileTypeSchema.nullable(),
    platforms: z.array(platformSchema),
    tones: z.array(toneSchema),
  })
  .meta({
    title: "Profile extended",
    description: "Profile extended description",
    ref: "ProfileExtendedSchema",
  });

export type ProfileExtended = z.infer<typeof profileExtendedSchema>;
