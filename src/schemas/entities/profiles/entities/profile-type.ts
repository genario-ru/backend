import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { profileType } from "@/db/schema";

import { profilesRegistry } from "../registry";

export const profileTypeSchema = createSelectSchema(profileType).register(
  profilesRegistry,
  {
    title: "Profile type",
    description: "Profile type description",
    ref: "ProfileTypeSchema",
  },
);

export type ProfileType = z.infer<typeof profileTypeSchema>;
