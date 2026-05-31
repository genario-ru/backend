CREATE UNIQUE INDEX "payment_payment_id_unique_idx" ON "payment" USING btree ("payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_method_payment_method_id_unique_idx" ON "payment_method" USING btree ("payment_method_id");--> statement-breakpoint
CREATE UNIQUE INDEX "credits_batch_to_payment_payment_id_unique_idx" ON "credits_batch_to_payment" USING btree ("payment_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_to_payment_payment_id_unique_idx" ON "subscription_to_payment" USING btree ("payment_id");