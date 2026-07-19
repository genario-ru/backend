ALTER TABLE "profile_attachment" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "profile_attachment" DROP COLUMN "status_details";--> statement-breakpoint
DROP TYPE "public"."profile_attachment_status";