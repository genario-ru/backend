CREATE TYPE "public"."generation_entity" AS ENUM('ideas-list', 'scenario-chapters', 'scenario-chapter-scenes', 'scenario-scene-preview');--> statement-breakpoint
CREATE TYPE "public"."credits_cost_action" AS ENUM('generate', 'regenerate');--> statement-breakpoint
CREATE TABLE "credits_cost" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity" "generation_entity" NOT NULL,
	"action" "credits_cost_action" NOT NULL,
	"amount" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_generation_log" RENAME TO "generation_log";--> statement-breakpoint
ALTER TABLE "generation_log" RENAME COLUMN "entity_type" TO "entity";--> statement-breakpoint
ALTER TABLE "credits_usage" RENAME COLUMN "entity_type" TO "entity";--> statement-breakpoint
ALTER TABLE "credits_usage" ALTER COLUMN "entity_id" SET NOT NULL;--> statement-breakpoint
DROP TYPE "public"."ai_generation_log_entity_type";--> statement-breakpoint
DROP TYPE "public"."credits_usage_entity";