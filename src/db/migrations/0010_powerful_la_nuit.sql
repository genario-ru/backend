CREATE TYPE "public"."generation_log_entity" AS ENUM('ideas-list', 'scenario-chapters', 'scenario-chapter-scenes', 'scenario-scene-preview');--> statement-breakpoint
CREATE TYPE "public"."credits_usage_entity" AS ENUM('ideas-list', 'scenario', 'scenario-scene-preview');--> statement-breakpoint
ALTER TABLE "credits_cost" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "credits_cost" CASCADE;--> statement-breakpoint
ALTER TABLE "generation_log" ALTER COLUMN "entity" SET DATA TYPE generation_log_entity;--> statement-breakpoint
ALTER TABLE "credits_usage" ALTER COLUMN "entity" SET DATA TYPE credits_usage_entity;--> statement-breakpoint
DROP TYPE "public"."generation_entity";--> statement-breakpoint
DROP TYPE "public"."credits_cost_action";