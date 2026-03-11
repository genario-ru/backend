import { relations } from "drizzle-orm";
import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { timestamps } from "@/db/constants/timestamps";

import { ideasList } from "./ideas-list";
import { scenario } from "./scenario";

export const template = pgTable("template", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  color: text("color").notNull(),
  ...timestamps,
});

export const templateRelations = relations(template, ({ many }) => ({
  scenarios: many(scenario),
  ideasLists: many(ideasList),
}));
