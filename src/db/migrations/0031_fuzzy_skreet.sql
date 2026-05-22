ALTER TABLE "export_document_format" DROP CONSTRAINT "export_document_format_slug_unique";--> statement-breakpoint
ALTER TABLE "legal_document" DROP CONSTRAINT "legal_document_slug_unique";--> statement-breakpoint
ALTER TABLE "production_status" DROP CONSTRAINT "production_status_slug_unique";--> statement-breakpoint
ALTER TABLE "scenario_scene_component_type" DROP CONSTRAINT "scenario_scene_component_type_slug_unique";--> statement-breakpoint
ALTER TABLE "template" DROP CONSTRAINT "template_slug_unique";--> statement-breakpoint
ALTER TABLE "referral_reward" DROP CONSTRAINT "referral_reward_slug_unique";--> statement-breakpoint
ALTER TABLE "credits_package" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "credits_package" ADD CONSTRAINT "credits_package_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "export_document_format" ADD CONSTRAINT "credits_package_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "legal_document" ADD CONSTRAINT "credits_package_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "platform" ADD CONSTRAINT "credits_package_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "production_status" ADD CONSTRAINT "credits_package_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "profile_type" ADD CONSTRAINT "credits_package_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "scenario_scene_component_type" ADD CONSTRAINT "credits_package_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "template" ADD CONSTRAINT "credits_package_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "tone" ADD CONSTRAINT "credits_package_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "video_duration" ADD CONSTRAINT "credits_package_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "video_type" ADD CONSTRAINT "credits_package_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "referral_reward" ADD CONSTRAINT "credits_package_slug_unique" UNIQUE("slug");