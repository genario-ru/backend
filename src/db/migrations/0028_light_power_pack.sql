CREATE TYPE "public"."payment_entity" AS ENUM('tariff', 'credits_package');--> statement-breakpoint
ALTER TABLE "transaction" RENAME TO "payment";--> statement-breakpoint
ALTER TABLE "payment" DROP CONSTRAINT "transaction_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "tariff" ALTER COLUMN "price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "tariff" ALTER COLUMN "old_price" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "tariff_discount" ALTER COLUMN "value" SET DATA TYPE numeric;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "payment_method" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "payment_method" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "entity" "payment_entity" NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ADD COLUMN "entity_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment" DROP COLUMN "payment_provider";--> statement-breakpoint
DROP TYPE "public"."transaction_payment_method";--> statement-breakpoint
DROP TYPE "public"."transaction_status";