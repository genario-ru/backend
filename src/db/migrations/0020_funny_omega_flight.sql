ALTER TABLE "ideas_list" ALTER COLUMN "status" SET DATA TYPE generation_status;--> statement-breakpoint
ALTER TABLE "scenario" ALTER COLUMN "metadata_status" SET DATA TYPE generation_status;--> statement-breakpoint
ALTER TABLE "scenario" ALTER COLUMN "metadata_status" SET DEFAULT 'idle';--> statement-breakpoint
ALTER TABLE "scenario_version" ALTER COLUMN "status" SET DATA TYPE generation_status;--> statement-breakpoint
DROP TYPE "public"."ideas_list_status";--> statement-breakpoint
DROP TYPE "public"."scenario_metadata_status";--> statement-breakpoint
DROP TYPE "public"."scenario_version_status";