ALTER TABLE "payment" RENAME COLUMN "payment_id" TO "external_id";--> statement-breakpoint
ALTER TABLE "payment_method" RENAME COLUMN "payment_method_id" TO "external_id";--> statement-breakpoint
DROP INDEX "payment_payment_id_unique_idx";--> statement-breakpoint
DROP INDEX "payment_payment_id_idx";--> statement-breakpoint
DROP INDEX "payment_method_payment_method_id_unique_idx";--> statement-breakpoint
DROP INDEX "payment_method_payment_method_id_idx";--> statement-breakpoint
CREATE UNIQUE INDEX "payment_external_id_unique_idx" ON "payment" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "payment_external_id_idx" ON "payment" USING btree ("external_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_method_external_id_unique_idx" ON "payment_method" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "payment_method_external_id_idx" ON "payment_method" USING btree ("external_id");