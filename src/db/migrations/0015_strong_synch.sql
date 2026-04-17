CREATE TABLE "scenario_to_platform" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" uuid NOT NULL,
	"platform_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scenario" DROP CONSTRAINT "scenario_platform_id_platform_id_fk";
--> statement-breakpoint
ALTER TABLE "scenario_to_platform" ADD CONSTRAINT "scenario_to_platform_scenario_id_scenario_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenario"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_to_platform" ADD CONSTRAINT "scenario_to_platform_platform_id_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario" DROP COLUMN "platform_id";