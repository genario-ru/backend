ALTER TYPE "public"."generation_log_entity" RENAME TO "generation_entity";--> statement-breakpoint
ALTER TABLE "credits_usage" ALTER COLUMN "entity" SET DATA TYPE generation_entity;--> statement-breakpoint
ALTER TABLE "credits_usage" ADD COLUMN "tokens_per_credit" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "credits_usage" DROP COLUMN "credit_price";--> statement-breakpoint
ALTER TABLE "credits_usage" DROP COLUMN "total_price";--> statement-breakpoint
DROP TYPE "public"."credits_usage_entity";