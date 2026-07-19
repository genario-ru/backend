UPDATE "platform" SET "has_auto_import" = true WHERE "slug" IN ('instagram', 'tiktok');--> statement-breakpoint
UPDATE "platform" SET "has_auto_import" = false WHERE "slug" = 'rutube';
