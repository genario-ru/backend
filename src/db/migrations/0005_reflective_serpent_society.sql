CREATE TYPE "public"."ai_generation_log_entity_type" AS ENUM('idea', 'scenario-chapter', 'scenario-scene', 'scenario-scene-component');--> statement-breakpoint
CREATE TYPE "public"."ideas_list_status" AS ENUM('pending', 'generation', 'failed', 'ready');--> statement-breakpoint
CREATE TABLE "ai_generation_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "ai_generation_log_entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"prompt" text,
	"model" text NOT NULL,
	"tokens" integer NOT NULL,
	"cost" numeric NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ideas_list" ADD COLUMN "status" "ideas_list_status" DEFAULT 'pending' NOT NULL;