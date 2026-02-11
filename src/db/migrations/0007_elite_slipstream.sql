CREATE TABLE "scenario_scene_component_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"optional" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "scenario_scene_component" ADD COLUMN "type_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "scenario_scene_component" ADD CONSTRAINT "scenario_scene_component_type_id_scenario_scene_component_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."scenario_scene_component_type"("id") ON DELETE cascade ON UPDATE cascade;