CREATE TYPE "public"."plan_discount_type" AS ENUM('fixed', 'percentage');--> statement-breakpoint
CREATE TYPE "public"."referral_invite_status" AS ENUM('registered', 'rewarded', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."referral_reward_type" AS ENUM('credits', 'plan_discount');--> statement-breakpoint
CREATE TYPE "public"."referral_reward_user_type" AS ENUM('referral_source', 'referral_target');--> statement-breakpoint
CREATE TABLE "plan_discount" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"plan_id" uuid,
	"type" "plan_discount_type" NOT NULL,
	"value" integer NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_invite_to_credits_batch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_invite_id" uuid NOT NULL,
	"credits_batch_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_invite_to_plan_discount" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"referral_invite_id" uuid NOT NULL,
	"plan_discount_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"referral_reward_id" uuid NOT NULL,
	"code" varchar(12) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referral_code_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referral_invite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reward_status" "referral_invite_status" NOT NULL,
	"referral_source_user_id" uuid NOT NULL,
	"referral_target_user_id" uuid NOT NULL,
	"referral_code_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_reward" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "referral_reward_type" NOT NULL,
	"user_type" "referral_reward_user_type" NOT NULL,
	"value" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referral_reward_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "plan_discount" ADD CONSTRAINT "plan_discount_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "plan_discount" ADD CONSTRAINT "plan_discount_plan_id_plan_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."plan"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite_to_credits_batch" ADD CONSTRAINT "referral_invite_to_credits_batch_referral_invite_id_referral_invite_id_fk" FOREIGN KEY ("referral_invite_id") REFERENCES "public"."referral_invite"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite_to_credits_batch" ADD CONSTRAINT "referral_invite_to_credits_batch_credits_batch_id_credits_batch_id_fk" FOREIGN KEY ("credits_batch_id") REFERENCES "public"."credits_batch"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite_to_plan_discount" ADD CONSTRAINT "referral_invite_to_plan_discount_referral_invite_id_referral_invite_id_fk" FOREIGN KEY ("referral_invite_id") REFERENCES "public"."referral_invite"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite_to_plan_discount" ADD CONSTRAINT "referral_invite_to_plan_discount_plan_discount_id_plan_discount_id_fk" FOREIGN KEY ("plan_discount_id") REFERENCES "public"."plan_discount"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_code" ADD CONSTRAINT "referral_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_code" ADD CONSTRAINT "referral_code_referral_reward_id_referral_reward_id_fk" FOREIGN KEY ("referral_reward_id") REFERENCES "public"."referral_reward"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_referral_source_user_id_user_id_fk" FOREIGN KEY ("referral_source_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_referral_target_user_id_user_id_fk" FOREIGN KEY ("referral_target_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_referral_code_id_referral_code_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_code"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "public"."credits_cost" ALTER COLUMN "entity" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."credits_cost_entity";--> statement-breakpoint
CREATE TYPE "public"."credits_cost_entity" AS ENUM('idea', 'scenario-scene-preview', 'scenario-scene-component');--> statement-breakpoint
ALTER TABLE "public"."credits_cost" ALTER COLUMN "entity" SET DATA TYPE "public"."credits_cost_entity" USING "entity"::"public"."credits_cost_entity";