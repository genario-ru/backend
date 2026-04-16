CREATE TABLE "scenario_chapter_production_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scenario_chapter_production_status_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "scenario" DROP CONSTRAINT "scenario_current_version_id_scenario_version_id_fk";
--> statement-breakpoint
ALTER TABLE "scenario_chapter" ADD COLUMN "production_status_id" uuid;--> statement-breakpoint
ALTER TABLE "scenario_chapter" ADD CONSTRAINT "scenario_chapter_production_status_id_scenario_chapter_production_status_id_fk" FOREIGN KEY ("production_status_id") REFERENCES "public"."scenario_chapter_production_status"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario" DROP COLUMN "current_version_id";