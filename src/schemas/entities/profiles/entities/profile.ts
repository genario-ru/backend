import { profile } from "@/db/schema";
import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";
import { userSchema } from "../../users/entities/user";
import { profileTypeSchema } from "./profile-type";
import { platformSchema } from "../../platforms/entities/platform";
import { toneSchema } from "../../tones/entities/tone";

export const profileSchema = createSelectSchema(profile);

export type Profile = z.infer<typeof profileSchema>;

export const profileExtendedSchema = profileSchema.extend(
  z.object({
    user: userSchema,
    type: profileTypeSchema,
    platforms: z.array(platformSchema),
    tones: z.array(toneSchema),
  }).shape,
);

export type ProfileExtended = z.infer<typeof profileExtendedSchema>;
