ALTER TABLE "profile_channel" ALTER COLUMN "external_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_channel" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ALTER COLUMN "external_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "attachment" ADD COLUMN "preview_url" text;--> statement-breakpoint
ALTER TABLE "profile_channel" ADD COLUMN "verified" boolean;--> statement-breakpoint
ALTER TABLE "profile_channel" ADD COLUMN "followers" integer;--> statement-breakpoint
ALTER TABLE "profile_channel" ADD COLUMN "following" integer;--> statement-breakpoint
ALTER TABLE "profile_channel" ADD COLUMN "total_posts" integer;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "likes" integer;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "views" integer;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "comments" integer;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "duration" text;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "summary" text;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "main_topics" text[];--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "key_points" text[];--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "tone" text;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "target_audience" text;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "quotes" text[];--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "timeline" text;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "word_count" integer;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "segments" integer;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "transcript" text;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "transcript_segments" jsonb[];--> statement-breakpoint
ALTER TABLE "public"."profile_attachment" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."profile_attachment_type";--> statement-breakpoint
CREATE TYPE "public"."profile_attachment_type" AS ENUM('actor-reference', 'thumbnail-reference', 'video-reference');--> statement-breakpoint
ALTER TABLE "public"."profile_attachment" ALTER COLUMN "type" SET DATA TYPE "public"."profile_attachment_type" USING "type"::"public"."profile_attachment_type";