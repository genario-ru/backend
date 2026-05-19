ALTER TABLE "subscription_to_payment" ALTER COLUMN "subscription_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_to_payment" ALTER COLUMN "payment_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription_to_payment" ADD COLUMN "next_subscription_id" uuid;--> statement-breakpoint
ALTER TABLE "subscription_to_payment" ADD CONSTRAINT "subscription_to_payment_next_subscription_id_subscription_id_fk" FOREIGN KEY ("next_subscription_id") REFERENCES "public"."subscription"("id") ON DELETE set null ON UPDATE cascade;