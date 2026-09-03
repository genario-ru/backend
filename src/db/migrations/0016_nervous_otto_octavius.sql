CREATE TYPE "public"."profile_image_attachment_type" AS ENUM('actor-reference', 'thumbnail-reference');--> statement-breakpoint
CREATE TABLE "profile_image_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "profile_image_attachment_type" NOT NULL,
	"profile_id" uuid NOT NULL,
	"attachment_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_video_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"attachment_id" uuid NOT NULL,
	"summary" text,
	"main_topics" text[],
	"key_points" text[],
	"tone" text,
	"target_audience" text,
	"quotes" text[],
	"timeline" text,
	"word_count" integer,
	"segments" integer,
	"transcript" text,
	"transcript_segments" jsonb[],
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE "profile_attachment" CASCADE;--> statement-breakpoint
ALTER TABLE "profile_image_attachment" ADD CONSTRAINT "profile_image_attachment_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_image_attachment" ADD CONSTRAINT "profile_image_attachment_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_video_attachment" ADD CONSTRAINT "profile_video_attachment_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_video_attachment" ADD CONSTRAINT "profile_video_attachment_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile" DROP COLUMN "description";--> statement-breakpoint
DROP TYPE "public"."profile_attachment_type";