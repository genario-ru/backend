CREATE TYPE "public"."tariff_generation_priority" AS ENUM('basic', 'medium', 'high');--> statement-breakpoint
ALTER TABLE "tariff_trial" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "tariff_trial" CASCADE;--> statement-breakpoint
ALTER TABLE "tariff" RENAME COLUMN "priority" TO "is_preferred";--> statement-breakpoint
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_tariff_trial_id_tariff_trial_id_fk";
--> statement-breakpoint
ALTER TABLE "tariff" ALTER COLUMN "billing_period" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "tariff" ADD COLUMN "duration_days" integer;--> statement-breakpoint
ALTER TABLE "tariff" ADD COLUMN "is_renewable" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "tariff" ADD COLUMN "max_profiles_amount" integer;--> statement-breakpoint
ALTER TABLE "tariff" ADD COLUMN "export_available" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tariff" ADD COLUMN "version_history_available" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tariff" ADD COLUMN "generation_priority" "tariff_generation_priority" DEFAULT 'basic' NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN "tariff_trial_id";--> statement-breakpoint
ALTER TABLE "subscription" DROP COLUMN "is_trial";