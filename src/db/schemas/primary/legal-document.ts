import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

export const legalDocument = pgTable("legal_document", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  ...timestamps,
});
