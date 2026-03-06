ALTER TYPE "public"."subscription_status" ADD VALUE 'pending' BEFORE 'active';--> statement-breakpoint
ALTER TABLE "subscription" ALTER COLUMN "status" SET DEFAULT 'pending';