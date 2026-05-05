ALTER TABLE "ideas_list" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ideas_list" ALTER COLUMN "description" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ideas_list" ADD COLUMN "prompt" text NOT NULL;