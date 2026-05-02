CREATE TYPE "public"."scenario_metadata_status" AS ENUM('pending', 'generation', 'failed', 'ready');--> statement-breakpoint
ALTER TYPE "public"."generation_entity" ADD VALUE 'scenario-metadata';--> statement-breakpoint
CREATE TABLE "scenario_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" uuid NOT NULL,
	"platform_id" uuid NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"tags" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "platform" ADD COLUMN "metadata_details" text;--> statement-breakpoint
ALTER TABLE "scenario" ADD COLUMN "metadata_status" "scenario_metadata_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "scenario_metadata" ADD CONSTRAINT "scenario_metadata_scenario_id_scenario_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenario"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_metadata" ADD CONSTRAINT "scenario_metadata_platform_id_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE cascade;