import { pgEnum } from "drizzle-orm/pg-core";

export const generationStatus = pgEnum("generation_status", [
  "pending",
  "generation",
  "failed",
  "ready",
]);
