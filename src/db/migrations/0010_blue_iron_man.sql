ALTER TABLE "profile_channel_video" DROP CONSTRAINT "profile_channel_video_profile_channel_id_profile_channel_id_fk";
--> statement-breakpoint
ALTER TABLE "profile_channel_video" ALTER COLUMN "profile_channel_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "profile_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD COLUMN "platform_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD CONSTRAINT "profile_channel_video_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD CONSTRAINT "profile_channel_video_platform_id_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD CONSTRAINT "profile_channel_video_profile_channel_id_profile_channel_id_fk" FOREIGN KEY ("profile_channel_id") REFERENCES "public"."profile_channel"("id") ON DELETE set null ON UPDATE cascade;