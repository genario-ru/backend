CREATE TABLE "profiles_from_channels_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "generation_status" NOT NULL,
	"status_details" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_channel_to_profiles_from_channels_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_channel_id" uuid NOT NULL,
	"profiles_from_channels_job_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_to_profiles_from_channels_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"profiles_from_channels_job_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "platform" ADD COLUMN "url_regex" text;--> statement-breakpoint
ALTER TABLE "profiles_from_channels_job" ADD CONSTRAINT "profiles_from_channels_job_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_channel_to_profiles_from_channels_job" ADD CONSTRAINT "profile_channel_to_profiles_from_channels_job_profile_channel_id_profile_channel_id_fk" FOREIGN KEY ("profile_channel_id") REFERENCES "public"."profile_channel"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_channel_to_profiles_from_channels_job" ADD CONSTRAINT "profile_channel_to_profiles_from_channels_job_profiles_from_channels_job_id_profiles_from_channels_job_id_fk" FOREIGN KEY ("profiles_from_channels_job_id") REFERENCES "public"."profiles_from_channels_job"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_to_profiles_from_channels_job" ADD CONSTRAINT "profile_to_profiles_from_channels_job_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_to_profiles_from_channels_job" ADD CONSTRAINT "profile_to_profiles_from_channels_job_profiles_from_channels_job_id_profiles_from_channels_job_id_fk" FOREIGN KEY ("profiles_from_channels_job_id") REFERENCES "public"."profiles_from_channels_job"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile" DROP COLUMN "is_draft";