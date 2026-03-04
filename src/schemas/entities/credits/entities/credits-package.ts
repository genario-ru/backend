import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { creditsPackage } from "@/db/schema";

import { billingRegistry } from "../registry";

export const creditsPackageSchema = createSelectSchema(creditsPackage).register(
  billingRegistry,
  {
    title: "Credits package",
    description: "Credits package description",
    ref: "CreditsPackageSchema",
  },
);

export type CreditsPackage = z.infer<typeof creditsPackageSchema>;
