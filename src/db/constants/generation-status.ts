import { pgEnum } from "drizzle-orm/pg-core";

export const generationStatus = pgEnum("generation_status", [
  "idle",
  "pending",
  "generation",
  "failed",
  "ready",
]);
