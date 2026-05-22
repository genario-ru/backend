import { relations } from "drizzle-orm";
import { integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { uniqueSlug } from "@/db/constants/slug";
import { timestamps } from "@/db/constants/timestamps";

import { ideasList } from "./ideas-list";
import { scenario } from "./scenario";

export const template = pgTable("template", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  details: text("details"),
  icon: text("icon"),
  color: text("color").notNull(),
  priority: integer("priority").notNull().default(0),
  ...uniqueSlug,
  ...timestamps,
});

export const templateRelations = relations(template, ({ many }) => ({
  scenarios: many(scenario),
  ideasLists: many(ideasList),
}));
