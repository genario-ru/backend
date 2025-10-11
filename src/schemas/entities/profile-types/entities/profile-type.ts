import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { profileType } from "@/db/schema";

export const profileTypeSchema = createSelectSchema(profileType);

export type ProfileType = z.infer<typeof profileTypeSchema>;
