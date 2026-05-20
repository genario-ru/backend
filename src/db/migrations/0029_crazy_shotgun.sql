ALTER TABLE "generation_log" ALTER COLUMN "tokens" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "credits_batch" ALTER COLUMN "remaining_amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "credits_package" ALTER COLUMN "amount" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "credits_usage" ALTER COLUMN "tokens_per_credit" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "referral_reward" ALTER COLUMN "value" SET DATA TYPE real;