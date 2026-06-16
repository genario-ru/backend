ALTER TABLE "idea" ADD COLUMN "hook" text;--> statement-breakpoint
ALTER TABLE "idea" ADD COLUMN "complexity" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "idea" ADD COLUMN "potential" integer DEFAULT 0 NOT NULL;