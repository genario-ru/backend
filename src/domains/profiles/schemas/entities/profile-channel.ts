import { createSelectSchema } from "drizzle-zod";

import { profileChannel } from "@/db/schema";
import { platformSchema } from "@/domains/platforms/schemas/entities/platform";
import { z } from "@/lib/zod";

export const profileChannelSchema = createSelectSchema(profileChannel).meta({
  title: "Profile channel",
  description: "Profile channel description",
  ref: "ProfileChannelSchema",
});

export type ProfileChannel = z.infer<typeof profileChannelSchema>;

export const profileChannelExtendedSchema = profileChannelSchema
  .extend({ platform: platformSchema })
  .meta({
    title: "Profile channel extended",
    description: "Profile channel extended description",
    ref: "ProfileChannelExtendedSchema",
  });

export type ProfileChannelExtended = z.infer<
  typeof profileChannelExtendedSchema
>;
