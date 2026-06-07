import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { uniqueSlug } from "@/db/constants/slug";
import { timestamps } from "@/db/constants/timestamps";

export const legalDocument = pgTable("legal_document", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  ...uniqueSlug(),
  ...timestamps,
});
