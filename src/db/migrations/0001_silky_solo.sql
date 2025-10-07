ALTER TABLE "idea_variant" RENAME TO "idea";--> statement-breakpoint
ALTER TABLE "idea" DROP CONSTRAINT "idea_variant_ideas_list_id_ideas_list_id_fk";
--> statement-breakpoint
ALTER TABLE "idea" DROP CONSTRAINT "idea_variant_video_type_id_video_type_id_fk";
--> statement-breakpoint
ALTER TABLE "idea" ADD CONSTRAINT "idea_ideas_list_id_ideas_list_id_fk" FOREIGN KEY ("ideas_list_id") REFERENCES "public"."ideas_list"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "idea" ADD CONSTRAINT "idea_video_type_id_video_type_id_fk" FOREIGN KEY ("video_type_id") REFERENCES "public"."video_type"("id") ON DELETE cascade ON UPDATE cascade;