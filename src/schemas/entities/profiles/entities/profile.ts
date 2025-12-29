import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { profile } from "@/db/schema";

import { platformSchema } from "../../platforms/entities/platform";
import { toneSchema } from "../../tones/entities/tone";
import { userSchema } from "../../users/entities/user";
import { profilesRegistry } from "../registry";
import { profileTypeSchema } from "./profile-type";

export const profileSchema = createSelectSchema(profile).register(
  profilesRegistry,
  {
    title: "Profile",
    description: "Profile description",
    ref: "ProfileSchema",
  },
);

export type Profile = z.infer<typeof profileSchema>;

export const profileExtendedSchema = profileSchema
  .extend({
    user: userSchema,
    type: profileTypeSchema,
    platforms: z.array(platformSchema),
    tones: z.array(toneSchema),
  })
  .register(profilesRegistry, {
    title: "Profile extended",
    description: "Profile extended description",
    ref: "ProfileExtendedSchema",
  });

export type ProfileExtended = z.infer<typeof profileExtendedSchema>;
