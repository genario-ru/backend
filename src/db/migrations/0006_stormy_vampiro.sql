CREATE TYPE "public"."profile_attachment_type" AS ENUM('actor-reference', 'thumbnail-reference', 'video-reference', 'transcript-reference');--> statement-breakpoint
CREATE TABLE "profile_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "profile_attachment_type" NOT NULL,
	"profile_id" uuid NOT NULL,
	"attachment_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "positioning" text;--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "additional_info" text;--> statement-breakpoint
ALTER TABLE "profile_attachment" ADD CONSTRAINT "profile_attachment_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_attachment" ADD CONSTRAINT "profile_attachment_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE cascade ON UPDATE cascade;