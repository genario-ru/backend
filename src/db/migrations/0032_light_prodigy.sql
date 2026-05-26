ALTER TABLE "payment_method" ADD COLUMN "default" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "status_updated_at" timestamp with time zone;