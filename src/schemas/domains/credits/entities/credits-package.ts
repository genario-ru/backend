import { createSelectSchema } from "drizzle-zod";

import { creditsPackage } from "@/db/schema";
import { z } from "@/lib/zod";

export const creditsPackageSchema = createSelectSchema(creditsPackage).meta({
  title: "Credits package",
  description: "Credits package description",
  ref: "CreditsPackageSchema",
});

export type CreditsPackage = z.infer<typeof creditsPackageSchema>;
