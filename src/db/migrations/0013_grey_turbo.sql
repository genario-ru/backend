ALTER TABLE "scenario_chapter_production_status" RENAME TO "production_status";--> statement-breakpoint
ALTER TABLE "production_status" DROP CONSTRAINT "scenario_chapter_production_status_slug_unique";--> statement-breakpoint
ALTER TABLE "scenario_chapter" DROP CONSTRAINT "scenario_chapter_production_status_id_scenario_chapter_production_status_id_fk";
--> statement-breakpoint
ALTER TABLE "scenario" ADD COLUMN "production_status_id" uuid;--> statement-breakpoint
ALTER TABLE "production_status" ADD COLUMN "for_scenario" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "production_status" ADD COLUMN "for_scenario_chapter" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_production_status_id_production_status_id_fk" FOREIGN KEY ("production_status_id") REFERENCES "public"."production_status"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_chapter" ADD CONSTRAINT "scenario_chapter_production_status_id_production_status_id_fk" FOREIGN KEY ("production_status_id") REFERENCES "public"."production_status"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "production_status" ADD CONSTRAINT "production_status_slug_unique" UNIQUE("slug");