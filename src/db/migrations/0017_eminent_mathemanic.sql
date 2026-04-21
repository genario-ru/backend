CREATE TYPE "public"."alert_status" AS ENUM('active', 'inactive');--> statement-breakpoint
ALTER TABLE "alert" ADD COLUMN "status" "alert_status" DEFAULT 'active' NOT NULL;