import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { plan } from "@/db/schema";

import { plansRegistry } from "../registry";

export const planSchema = createSelectSchema(plan).register(plansRegistry, {
  title: "Plan",
  description: "Plan description",
  ref: "PlanSchema",
});

export type Plan = z.infer<typeof planSchema>;
