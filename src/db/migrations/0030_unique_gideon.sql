CREATE TABLE "profile_channel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"internal_id" text NOT NULL,
	"slug" text,
	"url" text NOT NULL,
	"avatar_url" text,
	"name" text NOT NULL,
	"description" text,
	"platform_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_channel_video" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_channel_id" uuid NOT NULL,
	"internal_id" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profile" ADD COLUMN "is_template" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "profile_channel" ADD CONSTRAINT "profile_channel_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_channel" ADD CONSTRAINT "profile_channel_platform_id_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD CONSTRAINT "profile_channel_video_profile_channel_id_profile_channel_id_fk" FOREIGN KEY ("profile_channel_id") REFERENCES "public"."profile_channel"("id") ON DELETE cascade ON UPDATE cascade;