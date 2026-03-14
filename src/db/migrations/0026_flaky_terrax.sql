CREATE TABLE "ideas_list_to_export_document" (
	"ideas_list_id" uuid NOT NULL,
	"export_document_id" uuid NOT NULL,
	"saved_only" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_version_to_export_document" (
	"scenario_version_id" uuid NOT NULL,
	"export_document_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "export_document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"format_id" uuid NOT NULL,
	"attachment_id" uuid,
	"status" "generation_status" DEFAULT 'pending' NOT NULL,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "export_document_format" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text,
	"icon" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "export_document_format_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
DROP TABLE "ideas_list_export" CASCADE;--> statement-breakpoint
DROP TABLE "scenario_version_export" CASCADE;--> statement-breakpoint
ALTER TABLE "ideas_list_to_export_document" ADD CONSTRAINT "ideas_list_to_export_document_ideas_list_id_ideas_list_id_fk" FOREIGN KEY ("ideas_list_id") REFERENCES "public"."ideas_list"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ideas_list_to_export_document" ADD CONSTRAINT "ideas_list_to_export_document_export_document_id_export_document_id_fk" FOREIGN KEY ("export_document_id") REFERENCES "public"."export_document"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_version_to_export_document" ADD CONSTRAINT "scenario_version_to_export_document_scenario_version_id_scenario_version_id_fk" FOREIGN KEY ("scenario_version_id") REFERENCES "public"."scenario_version"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_version_to_export_document" ADD CONSTRAINT "scenario_version_to_export_document_export_document_id_export_document_id_fk" FOREIGN KEY ("export_document_id") REFERENCES "public"."export_document"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "export_document" ADD CONSTRAINT "export_document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "export_document" ADD CONSTRAINT "export_document_format_id_export_document_format_id_fk" FOREIGN KEY ("format_id") REFERENCES "public"."export_document_format"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "export_document" ADD CONSTRAINT "export_document_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
DROP TYPE "public"."export_format";