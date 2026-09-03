CREATE TYPE "public"."profile_attachment_status" AS ENUM('pending', 'generation', 'failed', 'ready');--> statement-breakpoint
ALTER TABLE "profile_attachment" ADD COLUMN "status" "profile_attachment_status" DEFAULT 'ready' NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_attachment" ADD COLUMN "status_details" text;