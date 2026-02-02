import { createSelectSchema } from "drizzle-zod";
import * as z from "zod";

import { planDiscount } from "@/db/schema";

import { userSchema } from "../../users/entities/user";
import { billingRegistry } from "../registry";
import { planSchema } from "./plan";

export const planDiscountSchema = createSelectSchema(planDiscount).register(
  billingRegistry,
  {
    title: "Plan discount",
    description: "Plan discount description",
    ref: "PlanDiscountSchema",
  },
);

export type PlanDiscount = z.infer<typeof planDiscountSchema>;

export const planDiscountExtendedSchema = planDiscountSchema
  .extend({
    user: userSchema,
    plan: planSchema,
  })
  .register(billingRegistry, {
    title: "Plan discount extended",
    description: "Plan discount extended description",
    ref: "PlanDiscountExtendedSchema",
  });
