CREATE TYPE "public"."credits_usage_entity" AS ENUM('ideas-list', 'scenario-version', 'scenario-version-chapter', 'scenario-scene-preview');--> statement-breakpoint
CREATE TYPE "public"."tariff_billing_period" AS ENUM('month', 'year');--> statement-breakpoint
CREATE TABLE "tariff_trial" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tariff_id" uuid,
	"slug" varchar(255) NOT NULL,
	"price" integer NOT NULL,
	"credits_amount" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"first_time_only" boolean DEFAULT true NOT NULL,
	"duration_days" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tariff_trial_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "credits_cost" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "credits_cost" CASCADE;--> statement-breakpoint
ALTER TABLE "credits_usage" DROP CONSTRAINT "credits_usage_credits_cost_id_credits_cost_id_fk";
--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "next_billing_at" SET DATA TYPE date;--> statement-breakpoint
ALTER TABLE "transaction" ALTER COLUMN "amount" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "credits_batch" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "credits_batch" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "credits_usage" ADD COLUMN "entity_id" uuid;--> statement-breakpoint
ALTER TABLE "credits_usage" ADD COLUMN "entity" "credits_usage_entity" NOT NULL;--> statement-breakpoint
ALTER TABLE "credits_usage" ADD COLUMN "amount" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "tariff_trial_id" uuid;--> statement-breakpoint
ALTER TABLE "tariff" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "tariff" ADD COLUMN "old_price" integer;--> statement-breakpoint
ALTER TABLE "tariff" ADD COLUMN "billing_period" "tariff_billing_period" DEFAULT 'month';--> statement-breakpoint
ALTER TABLE "tariff_trial" ADD CONSTRAINT "tariff_trial_tariff_id_tariff_id_fk" FOREIGN KEY ("tariff_id") REFERENCES "public"."tariff"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_tariff_trial_id_tariff_trial_id_fk" FOREIGN KEY ("tariff_trial_id") REFERENCES "public"."tariff_trial"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "credits_package" DROP COLUMN "expires_at";--> statement-breakpoint
ALTER TABLE "credits_usage" DROP COLUMN "credits_cost_id";--> statement-breakpoint
ALTER TABLE "tariff" DROP COLUMN "period";--> statement-breakpoint
ALTER TABLE "tariff" ADD CONSTRAINT "tariff_slug_unique" UNIQUE("slug");--> statement-breakpoint
ALTER TABLE "public"."transaction" ALTER COLUMN "payment_method" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."transaction_payment_method";--> statement-breakpoint
CREATE TYPE "public"."transaction_payment_method" AS ENUM('card', 'sbp');--> statement-breakpoint
ALTER TABLE "public"."transaction" ALTER COLUMN "payment_method" SET DATA TYPE "public"."transaction_payment_method" USING "payment_method"::"public"."transaction_payment_method";--> statement-breakpoint
DROP TYPE "public"."credits_cost_action";--> statement-breakpoint
DROP TYPE "public"."credits_cost_entity";