ALTER TABLE "referral_invite_to_credits_batch" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "referral_invite_to_plan_discount" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "referral_invite_to_credits_batch" CASCADE;--> statement-breakpoint
DROP TABLE "referral_invite_to_plan_discount" CASCADE;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD COLUMN "credits_batch_id" uuid;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD COLUMN "plan_discount_id" uuid;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_credits_batch_id_credits_batch_id_fk" FOREIGN KEY ("credits_batch_id") REFERENCES "public"."credits_batch"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_plan_discount_id_plan_discount_id_fk" FOREIGN KEY ("plan_discount_id") REFERENCES "public"."plan_discount"("id") ON DELETE cascade ON UPDATE cascade;