ALTER TYPE "public"."payment_status" ADD VALUE 'failed';--> statement-breakpoint
CREATE TABLE "subscription_to_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid,
	"payment_id" uuid
);
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "generation_log" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "credits_batch" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "credits_cost" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "credits_package" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "credits_usage" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "payment_method" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "next_billing_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "status" SET DEFAULT 'active';--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "tariff" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "tariff_discount" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "profiles_from_channels_job" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "credits_package_to_credits_batch" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "ideas_list_to_export_document" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "ideas_list_to_tone" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "ideas_list_to_video_type" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "platform_to_video_type" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "profile_channel_to_profiles_from_channels_job" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "profile_to_platform" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "profile_to_profiles_from_channels_job" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "profile_to_tone" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "scenario_to_tone" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "scenario_version_to_export_document" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "subscription_to_credits_batch" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "attachment" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "export_document" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "export_document_format" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "idea" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "ideas_list" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "platform" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "profile" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "profile_attachment" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "profile_channel" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "profile_channel_video" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "profile_type" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "scenario" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "scenario_chapter" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "scenario_scene" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "scenario_scene_component" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "scenario_scene_component_type" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "scenario_scene_preview" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "scenario_version" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "scenario_video_reference" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "template" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "tone" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "video_duration" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "video_type" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "referral_code" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "referral_invite" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "referral_reward" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "alert" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "created_at" SET DEFAULT '2026-04-02T23:13:50.949Z';--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "status_details" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "cycle_starts_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "cycle_ends_at" timestamp with time zone NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "failed_billing_attempts" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "tariff" ADD COLUMN "credits_package_id" uuid;--> statement-breakpoint
ALTER TABLE "subscription_to_payment" ADD CONSTRAINT "subscription_to_payment_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_to_payment" ADD CONSTRAINT "subscription_to_payment_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tariff" ADD CONSTRAINT "tariff_credits_package_id_credits_package_id_fk" FOREIGN KEY ("credits_package_id") REFERENCES "public"."credits_package"("id") ON DELETE cascade ON UPDATE set null;--> statement-breakpoint
ALTER TABLE "tariff" DROP COLUMN "credits_amount";--> statement-breakpoint
ALTER TABLE "public"."subscription" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."subscription_status";--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('active', 'overdue', 'cancelled', 'terminated');--> statement-breakpoint
ALTER TABLE "public"."subscription" ALTER COLUMN "status" SET DATA TYPE "public"."subscription_status" USING "status"::"public"."subscription_status";