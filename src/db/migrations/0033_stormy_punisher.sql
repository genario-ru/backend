ALTER TABLE "platform" ADD COLUMN "channel_url_regex" text;--> statement-breakpoint
ALTER TABLE "platform" ADD COLUMN "has_auto_import" boolean DEFAULT false NOT NULL;