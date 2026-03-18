ALTER TABLE "generation_log" ALTER COLUMN "cost" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "credits_usage" ALTER COLUMN "credits_amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "credits_usage" ALTER COLUMN "credit_price" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "credits_usage" ALTER COLUMN "total_price" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "payment" ALTER COLUMN "amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "tariff" ALTER COLUMN "price" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "tariff" ALTER COLUMN "old_price" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "tariff_discount" ALTER COLUMN "value" SET DATA TYPE real;