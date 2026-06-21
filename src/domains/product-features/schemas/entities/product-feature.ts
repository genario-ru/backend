import { createSelectSchema } from "drizzle-zod";

import { productFeature } from "@/db/schema";

export const productFeatureSchema = createSelectSchema(productFeature).meta({
  title: "Product feature",
  description: "Product feature description",
  ref: "ProductFeatureSchema",
});
