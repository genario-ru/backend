CREATE TYPE "public"."credits_batch_status" AS ENUM('pending', 'active', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('pending', 'succeeded', 'canceled', 'failed');--> statement-breakpoint
ALTER TYPE "public"."payment_method_status" ADD VALUE 'inactive';--> statement-breakpoint
ALTER TYPE "public"."subscription_status" ADD VALUE 'pending' BEFORE 'active';--> statement-breakpoint
CREATE TABLE "refund" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text NOT NULL,
	"payment_id" uuid NOT NULL,
	"status" "refund_status" NOT NULL,
	"status_details" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refund_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "credits_batch_to_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credits_batch_id" uuid,
	"payment_id" uuid
);
--> statement-breakpoint
ALTER TABLE "credits_package_to_credits_batch" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "credits_package_to_payment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "tariff_to_payment" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "credits_package_to_credits_batch" CASCADE;--> statement-breakpoint
DROP TABLE "credits_package_to_payment" CASCADE;--> statement-breakpoint
DROP TABLE "tariff_to_payment" CASCADE;--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "verification" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "generation_log" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "credits_batch" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "credits_cost" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "credits_package" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "credits_usage" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "payment_method" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "starts_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "cycle_starts_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "cycle_ends_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tariff" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tariff_discount" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profiles_from_channels_job" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ideas_list_to_export_document" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ideas_list_to_tone" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ideas_list_to_video_type" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "platform_to_video_type" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profile_channel_to_profiles_from_channels_job" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profile_to_platform" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profile_to_profiles_from_channels_job" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profile_to_tone" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "scenario_to_tone" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "scenario_version_to_export_document" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "subscription_to_credits_batch" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "attachment" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "export_document" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "export_document_format" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "idea" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "ideas_list" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "platform" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profile" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profile_attachment" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profile_channel" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "profile_type" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "scenario" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "scenario_chapter" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "scenario_scene" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "scenario_scene_component" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "scenario_scene_component_type" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "scenario_scene_preview" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "scenario_version" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "scenario_video_reference" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "template" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tone" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "video_duration" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "video_type" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "referral_code" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "referral_invite" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "referral_reward" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "alert" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "created_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "credits_batch" ADD COLUMN "credits_package_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "credits_batch" ADD COLUMN "status" "credits_batch_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_method" ADD COLUMN "status_details" text;--> statement-breakpoint
ALTER TABLE "refund" ADD CONSTRAINT "refund_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "credits_batch_to_payment" ADD CONSTRAINT "credits_batch_to_payment_credits_batch_id_credits_batch_id_fk" FOREIGN KEY ("credits_batch_id") REFERENCES "public"."credits_batch"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "credits_batch_to_payment" ADD CONSTRAINT "credits_batch_to_payment_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "credits_batch" ADD CONSTRAINT "credits_batch_credits_package_id_credits_package_id_fk" FOREIGN KEY ("credits_package_id") REFERENCES "public"."credits_package"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "credits_batch" DROP COLUMN "initial_amount";