ALTER TABLE "credits_usage" RENAME COLUMN "entity" TO "entity_type";--> statement-breakpoint
ALTER TABLE "public"."ai_generation_log" ALTER COLUMN "entity_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."ai_generation_log_entity_type";--> statement-breakpoint
CREATE TYPE "public"."ai_generation_log_entity_type" AS ENUM('ideas-list', 'scenario-version', 'scenario-version-chapter', 'scenario-scene-preview');--> statement-breakpoint
ALTER TABLE "public"."ai_generation_log" ALTER COLUMN "entity_type" SET DATA TYPE "public"."ai_generation_log_entity_type" USING "entity_type"::"public"."ai_generation_log_entity_type";