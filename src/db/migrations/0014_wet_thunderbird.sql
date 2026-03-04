ALTER TYPE "public"."plan_discount_type" RENAME TO "tariff_discount_type";--> statement-breakpoint
ALTER TABLE "plan" RENAME TO "tariff";--> statement-breakpoint
ALTER TABLE "plan_discount" RENAME TO "tariff_discount";--> statement-breakpoint
ALTER TABLE "tariff_discount" RENAME COLUMN "plan_id" TO "tariff_id";--> statement-breakpoint
ALTER TABLE "subscription" RENAME COLUMN "plan_id" TO "tariff_id";--> statement-breakpoint
ALTER TABLE "referral_invite" RENAME COLUMN "plan_discount_id" TO "tariff_discount_id";--> statement-breakpoint
ALTER TABLE "tariff_discount" DROP CONSTRAINT "plan_discount_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tariff_discount" DROP CONSTRAINT "plan_discount_plan_id_plan_id_fk";
--> statement-breakpoint
ALTER TABLE "subscription" DROP CONSTRAINT "subscription_plan_id_plan_id_fk";
--> statement-breakpoint
ALTER TABLE "referral_invite" DROP CONSTRAINT "referral_invite_plan_discount_id_plan_discount_id_fk";
--> statement-breakpoint
ALTER TABLE "tariff_discount" ADD CONSTRAINT "tariff_discount_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tariff_discount" ADD CONSTRAINT "tariff_discount_tariff_id_tariff_id_fk" FOREIGN KEY ("tariff_id") REFERENCES "public"."tariff"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_tariff_id_tariff_id_fk" FOREIGN KEY ("tariff_id") REFERENCES "public"."tariff"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_tariff_discount_id_tariff_discount_id_fk" FOREIGN KEY ("tariff_discount_id") REFERENCES "public"."tariff_discount"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "public"."referral_reward" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."referral_reward_type";--> statement-breakpoint
CREATE TYPE "public"."referral_reward_type" AS ENUM('credits', 'tariff_discount');--> statement-breakpoint
ALTER TABLE "public"."referral_reward" ALTER COLUMN "type" SET DATA TYPE "public"."referral_reward_type" USING "type"::"public"."referral_reward_type";