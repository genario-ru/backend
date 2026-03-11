CREATE TYPE "public"."export_format" AS ENUM('pdf', 'docx');--> statement-breakpoint
CREATE TYPE "public"."generation_status" AS ENUM('pending', 'generation', 'failed', 'ready');--> statement-breakpoint
CREATE TABLE "ideas_list_export" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"ideas_list_id" uuid NOT NULL,
	"attachment_id" uuid,
	"format" "export_format" NOT NULL,
	"status" "generation_status" DEFAULT 'pending' NOT NULL,
	"saved_only" boolean DEFAULT false NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_version_export" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"scenario_version_id" uuid NOT NULL,
	"attachment_id" uuid,
	"format" "export_format" NOT NULL,
	"status" "generation_status" DEFAULT 'pending' NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ideas_list_export" ADD CONSTRAINT "ideas_list_export_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ideas_list_export" ADD CONSTRAINT "ideas_list_export_ideas_list_id_ideas_list_id_fk" FOREIGN KEY ("ideas_list_id") REFERENCES "public"."ideas_list"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ideas_list_export" ADD CONSTRAINT "ideas_list_export_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_version_export" ADD CONSTRAINT "scenario_version_export_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_version_export" ADD CONSTRAINT "scenario_version_export_scenario_version_id_scenario_version_id_fk" FOREIGN KEY ("scenario_version_id") REFERENCES "public"."scenario_version"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_version_export" ADD CONSTRAINT "scenario_version_export_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE set null ON UPDATE cascade;