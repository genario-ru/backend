CREATE TABLE "application_to_product_feature" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"application_id" uuid NOT NULL,
	"product_feature_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"comment" text,
	"marketing_accepted" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "application_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "product_feature" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"icon" text NOT NULL,
	"color" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"available" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_to_product_feature" ADD CONSTRAINT "application_to_product_feature_application_id_application_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."application"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "application_to_product_feature" ADD CONSTRAINT "application_to_product_feature_product_feature_id_product_feature_id_fk" FOREIGN KEY ("product_feature_id") REFERENCES "public"."product_feature"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "application_to_product_feature_unique_idx" ON "application_to_product_feature" USING btree ("application_id","product_feature_id");--> statement-breakpoint
CREATE INDEX "application_to_product_feature_application_id_idx" ON "application_to_product_feature" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_to_product_feature_product_feature_id_idx" ON "application_to_product_feature" USING btree ("product_feature_id");