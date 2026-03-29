ALTER TABLE "referral_invite" DROP CONSTRAINT "referral_invite_credits_batch_id_credits_batch_id_fk";
--> statement-breakpoint
ALTER TABLE "referral_invite" DROP CONSTRAINT "referral_invite_tariff_discount_id_tariff_discount_id_fk";
--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_credits_batch_id_credits_batch_id_fk" FOREIGN KEY ("credits_batch_id") REFERENCES "public"."credits_batch"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_tariff_discount_id_tariff_discount_id_fk" FOREIGN KEY ("tariff_discount_id") REFERENCES "public"."tariff_discount"("id") ON DELETE set null ON UPDATE cascade;