import { pgEnum } from "drizzle-orm/pg-core";

export const generationEntity = pgEnum("generation_entity", [
  "ideas-list",
  "scenario-chapters",
  "scenario-chapter-scenes",
  "scenario-chapter-scene",
  "scenario-scene-preview",
  "scenario-metadata",
  "scenario-metadata-item",
]);
