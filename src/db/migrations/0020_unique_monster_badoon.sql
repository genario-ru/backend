ALTER TABLE "credits_usage" RENAME COLUMN "amount" TO "credits_amount";--> statement-breakpoint
ALTER TABLE "credits_usage" ADD COLUMN "credit_price" numeric NOT NULL;--> statement-breakpoint
ALTER TABLE "credits_usage" ADD COLUMN "total_price" numeric NOT NULL;