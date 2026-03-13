ALTER TABLE "scenario" ALTER COLUMN "name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "scenario" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "scenario_chapter" ALTER COLUMN "description" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "scenario_scene" DROP COLUMN "description";