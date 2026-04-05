import { createSelectSchema } from "drizzle-zod";

import { profileChannelVideo } from "@/db/schema";
import type { z } from "@/lib/zod";

import { profileChannelSchema } from "./profile-channel";

export const profileChannelVideoSchema = createSelectSchema(
  profileChannelVideo,
).meta({
  title: "Profile channel video",
  description: "Profile channel video description",
  ref: "ProfileChannelVideoSchema",
});

export type ProfileChannelVideo = z.infer<typeof profileChannelVideoSchema>;

export const profileChannelVideoExtendedSchema = profileChannelVideoSchema
  .extend({ profileChannel: profileChannelSchema })
  .meta({
    title: "Profile channel video extended",
    description: "Profile channel video extended description",
    ref: "ProfileChannelVideoExtendedSchema",
  });

export type ProfileChannelVideoExtended = z.infer<
  typeof profileChannelVideoExtendedSchema
>;
