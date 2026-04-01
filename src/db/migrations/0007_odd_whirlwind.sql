CREATE TYPE "public"."payment_method_status" AS ENUM('pending', 'active');--> statement-breakpoint
ALTER TABLE "payment_method" ADD COLUMN "status" "payment_method_status" NOT NULL;--> statement-breakpoint
ALTER TABLE "payment_method" ADD COLUMN "title" text;--> statement-breakpoint
ALTER TABLE "payment_method" ADD COLUMN "confirmation_url" text;--> statement-breakpoint
ALTER TABLE "payment_method" ADD COLUMN "data" jsonb;