CREATE TYPE "public"."scenario_scene_preview_status" AS ENUM('pending', 'generation', 'failed', 'ready');--> statement-breakpoint
CREATE TABLE "scenario_scene_preview" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_scene_id" uuid NOT NULL,
	"attachment_id" uuid,
	"status" "scenario_scene_preview_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scenario_scene" DROP CONSTRAINT "scenario_scene_preview_id_attachment_id_fk";
--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "bucket_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "mime_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "scenario_scene_preview" ADD CONSTRAINT "scenario_scene_preview_scenario_scene_id_scenario_scene_id_fk" FOREIGN KEY ("scenario_scene_id") REFERENCES "public"."scenario_scene"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_scene_preview" ADD CONSTRAINT "scenario_scene_preview_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "attachment" DROP COLUMN "storage_provider";--> statement-breakpoint
ALTER TABLE "attachment" DROP COLUMN "storage_bucket";--> statement-breakpoint
ALTER TABLE "attachment" DROP COLUMN "storage_key";--> statement-breakpoint
ALTER TABLE "attachment" DROP COLUMN "file_name";--> statement-breakpoint
ALTER TABLE "attachment" DROP COLUMN "file_bytes_size";--> statement-breakpoint
ALTER TABLE "attachment" DROP COLUMN "file_mime_type";--> statement-breakpoint
ALTER TABLE "scenario_scene" DROP COLUMN "preview_id";