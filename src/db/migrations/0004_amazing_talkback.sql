CREATE TABLE "credits_package_to_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credits_package_id" uuid,
	"payment_id" uuid
);
--> statement-breakpoint
CREATE TABLE "tariff_to_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tariff_id" uuid,
	"payment_id" uuid
);
--> statement-breakpoint
ALTER TABLE "credits_package" ADD COLUMN "price" real NOT NULL;--> statement-breakpoint
ALTER TABLE "credits_package" ADD COLUMN "old_price" real;--> statement-breakpoint
ALTER TABLE "credits_package_to_payment" ADD CONSTRAINT "credits_package_to_payment_credits_package_id_credits_package_id_fk" FOREIGN KEY ("credits_package_id") REFERENCES "public"."credits_package"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "credits_package_to_payment" ADD CONSTRAINT "credits_package_to_payment_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tariff_to_payment" ADD CONSTRAINT "tariff_to_payment_tariff_id_tariff_id_fk" FOREIGN KEY ("tariff_id") REFERENCES "public"."tariff"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tariff_to_payment" ADD CONSTRAINT "tariff_to_payment_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment" DROP COLUMN "entity";--> statement-breakpoint
ALTER TABLE "payment" DROP COLUMN "entity_id";