CREATE TYPE "public"."generation_entity" AS ENUM('ideas-list', 'scenario-chapters', 'scenario-chapter-scenes', 'scenario-scene-preview', 'scenario-metadata', 'scenario-metadata-item');--> statement-breakpoint
CREATE TYPE "public"."generation_status" AS ENUM('idle', 'pending', 'generation', 'failed', 'ready');--> statement-breakpoint
CREATE TYPE "public"."email_log_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."email_template_key" AS ENUM('otp', 'email_verification', 'upcoming_subscription_charge', 'subscription_payment_failed');--> statement-breakpoint
CREATE TYPE "public"."credits_batch_status" AS ENUM('pending', 'active', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."payment_entity" AS ENUM('tariff', 'credits_package');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'canceled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."payment_method_status" AS ENUM('pending', 'active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."refund_status" AS ENUM('pending', 'succeeded', 'canceled', 'failed');--> statement-breakpoint
CREATE TYPE "public"."subscription_status" AS ENUM('pending', 'active', 'overdue', 'cancelled', 'terminated');--> statement-breakpoint
CREATE TYPE "public"."tariff_billing_period" AS ENUM('month', 'year');--> statement-breakpoint
CREATE TYPE "public"."tariff_generation_priority" AS ENUM('basic', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."tariff_discount_type" AS ENUM('fixed', 'percentage');--> statement-breakpoint
CREATE TYPE "public"."scenario_chapter_status" AS ENUM('pending', 'generation', 'failed', 'ready');--> statement-breakpoint
CREATE TYPE "public"."scenario_scene_preview_status" AS ENUM('pending', 'generation', 'failed', 'ready');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."referral_invite_status" AS ENUM('registered', 'rewarded', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."referral_reward_type" AS ENUM('credits', 'tariff_discount');--> statement-breakpoint
CREATE TYPE "public"."referral_reward_user_type" AS ENUM('referral_source', 'referral_target');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."alert_type" AS ENUM('info', 'warning', 'negative', 'positive');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token" text,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"id_token" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "account_account_id_unique" UNIQUE("account_id"),
	CONSTRAINT "account_access_token_unique" UNIQUE("access_token"),
	CONSTRAINT "account_refresh_token_unique" UNIQUE("refresh_token")
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"ip_address" varchar(45) NOT NULL,
	"user_agent" text NOT NULL,
	"impersonated_by" uuid,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"to" text NOT NULL,
	"from" text NOT NULL,
	"subject" text NOT NULL,
	"template_key" "email_template_key" NOT NULL,
	"status" "email_log_status" DEFAULT 'pending' NOT NULL,
	"message_id" text,
	"error" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "generation_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity" "generation_entity" NOT NULL,
	"entity_id" uuid NOT NULL,
	"prompt" text,
	"model" text NOT NULL,
	"tokens" real NOT NULL,
	"cost" real,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credits_batch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"credits_package_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"remaining_amount" real NOT NULL,
	"status" "credits_batch_status" DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credits_package" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"amount" real NOT NULL,
	"price" real NOT NULL,
	"old_price" real,
	"for_purchase" boolean DEFAULT false NOT NULL,
	"is_preferred" boolean DEFAULT false NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "credits_package_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "credits_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"credits_batch_id" uuid NOT NULL,
	"entity" "generation_entity" NOT NULL,
	"entity_id" uuid NOT NULL,
	"credits_amount" real NOT NULL,
	"tokens_per_credit" real NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"payment_method_id" uuid,
	"external_id" text NOT NULL,
	"payment_link" text,
	"amount" real NOT NULL,
	"currency" text NOT NULL,
	"status" "payment_status" NOT NULL,
	"status_details" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_method" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"external_id" text NOT NULL,
	"status" "payment_method_status" NOT NULL,
	"status_details" text,
	"type" text NOT NULL,
	"title" text,
	"confirmation_url" text,
	"data" jsonb,
	"default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refund" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_id" text NOT NULL,
	"payment_id" uuid NOT NULL,
	"status" "refund_status" NOT NULL,
	"status_details" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refund_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tariff_id" uuid NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"cycle_starts_at" timestamp with time zone,
	"cycle_ends_at" timestamp with time zone,
	"last_billed_at" timestamp with time zone,
	"next_billing_at" timestamp with time zone,
	"failed_billing_attempts" integer DEFAULT 0 NOT NULL,
	"status" "subscription_status" DEFAULT 'pending' NOT NULL,
	"status_updated_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tariff" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credits_package_id" uuid,
	"slug" varchar(255) NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price" real NOT NULL,
	"old_price" real,
	"billing_period" "tariff_billing_period",
	"duration_days" integer,
	"is_renewable" boolean DEFAULT true NOT NULL,
	"is_preferred" boolean DEFAULT false NOT NULL,
	"max_profiles_amount" integer,
	"export_available" boolean DEFAULT false NOT NULL,
	"version_history_available" boolean DEFAULT false NOT NULL,
	"generation_priority" "tariff_generation_priority" DEFAULT 'basic' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tariff_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tariff_discount" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"tariff_id" uuid,
	"type" "tariff_discount_type" NOT NULL,
	"value" real NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles_from_channels_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "generation_status" NOT NULL,
	"status_details" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "credits_batch_to_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"credits_batch_id" uuid,
	"payment_id" uuid
);
--> statement-breakpoint
CREATE TABLE "ideas_list_to_export_document" (
	"ideas_list_id" uuid NOT NULL,
	"export_document_id" uuid NOT NULL,
	"saved_only" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ideas_list_to_tone" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ideas_list_id" uuid NOT NULL,
	"tone_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ideas_list_to_video_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ideas_list_id" uuid NOT NULL,
	"video_type_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "platform_to_video_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_id" uuid NOT NULL,
	"video_type_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_channel_to_profiles_from_channels_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_channel_id" uuid NOT NULL,
	"profiles_from_channels_job_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_to_platform" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"platform_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_to_profiles_from_channels_job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"profiles_from_channels_job_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_to_tone" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"tone_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_to_platform" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" uuid NOT NULL,
	"platform_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_to_tone" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" uuid NOT NULL,
	"tone_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_version_to_export_document" (
	"scenario_version_id" uuid NOT NULL,
	"export_document_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_to_credits_batch" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"credits_batch_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "subscription_to_payment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscription_id" uuid NOT NULL,
	"next_subscription_id" uuid,
	"payment_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"key" text NOT NULL,
	"bucket_name" text NOT NULL,
	"mime_type" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "export_document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"format_id" uuid NOT NULL,
	"attachment_id" uuid,
	"status" "generation_status" DEFAULT 'pending' NOT NULL,
	"status_details" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "export_document_format" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"color" text,
	"icon" text,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "export_document_format_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "idea" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ideas_list_id" uuid NOT NULL,
	"video_type_id" uuid NOT NULL,
	"saved" boolean DEFAULT false NOT NULL,
	"liked" boolean,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ideas_list" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_id" uuid,
	"template_id" uuid,
	"status" "generation_status" DEFAULT 'pending' NOT NULL,
	"prompt" text NOT NULL,
	"name" text,
	"description" text,
	"target_audience" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_document" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "legal_document_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "platform" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"details" text,
	"metadata_details" text,
	"logo_url" text,
	"base_url" text,
	"url_regex" text,
	"channel_url_regex" text,
	"has_auto_import" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "platform_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "production_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"color" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"for_scenario" boolean DEFAULT false NOT NULL,
	"for_scenario_chapter" boolean DEFAULT false NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "production_status_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "profile" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type_id" uuid,
	"name" text NOT NULL,
	"description" text,
	"target_audience" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_attachment" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"profile_id" uuid NOT NULL,
	"attachment_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_channel" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_id" uuid NOT NULL,
	"internal_id" text NOT NULL,
	"slug" text,
	"url" text NOT NULL,
	"avatar_url" text,
	"name" text NOT NULL,
	"description" text,
	"platform_id" uuid NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_channel_video" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"profile_channel_id" uuid NOT NULL,
	"internal_id" text NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_type_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "scenario" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"profile_id" uuid,
	"template_id" uuid,
	"video_type_id" uuid,
	"video_duration_id" uuid,
	"production_status_id" uuid,
	"saved" boolean DEFAULT false NOT NULL,
	"metadata_status" "generation_status" DEFAULT 'idle' NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"target_audience" text,
	"scheduled_start_at" timestamp with time zone,
	"scheduled_end_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_chapter" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_version_id" uuid NOT NULL,
	"production_status_id" uuid,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"status" "scenario_chapter_status" DEFAULT 'pending' NOT NULL,
	"start_time" integer NOT NULL,
	"end_time" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_metadata" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" uuid NOT NULL,
	"platform_id" uuid NOT NULL,
	"status" "generation_status" DEFAULT 'idle' NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"tags" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_scene" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_chapter_id" uuid NOT NULL,
	"name" text NOT NULL,
	"start_time" integer NOT NULL,
	"end_time" integer NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_scene_component" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type_id" uuid NOT NULL,
	"scenario_scene_id" uuid NOT NULL,
	"name" text NOT NULL,
	"content" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_scene_component_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"details" text,
	"icon" text,
	"color" text,
	"optional" boolean DEFAULT false NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "scenario_scene_component_type_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "scenario_scene_preview" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_scene_id" uuid NOT NULL,
	"attachment_id" uuid,
	"compressed_attachment_id" uuid,
	"status" "scenario_scene_preview_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_version" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_id" uuid NOT NULL,
	"status" "generation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scenario_video_reference" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scenario_version_id" uuid NOT NULL,
	"platform_id" uuid NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"details" text,
	"icon" text,
	"color" text NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "template_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "tone" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tone_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"marketing_accepted" boolean DEFAULT false NOT NULL,
	"phone" text,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"name" text NOT NULL,
	"image" text,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "video_duration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"min_seconds" integer NOT NULL,
	"max_seconds" integer,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "video_duration_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "video_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"icon" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "video_type_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "referral_code" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"referral_reward_id" uuid NOT NULL,
	"code" varchar(8) NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referral_code_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "referral_invite" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reward_status" "referral_invite_status" NOT NULL,
	"referral_source_user_id" uuid NOT NULL,
	"referral_target_user_id" uuid NOT NULL,
	"referral_code_id" uuid NOT NULL,
	"credits_batch_id" uuid,
	"tariff_discount_id" uuid,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referral_reward" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "referral_reward_type" NOT NULL,
	"user_type" "referral_reward_user_type" NOT NULL,
	"value" real NOT NULL,
	"slug" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "referral_reward_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "alert" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"type" "alert_type" DEFAULT 'info' NOT NULL,
	"status" "alert_status" DEFAULT 'active' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_impersonated_by_user_id_fk" FOREIGN KEY ("impersonated_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "email_log" ADD CONSTRAINT "email_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "credits_batch" ADD CONSTRAINT "credits_batch_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "credits_batch" ADD CONSTRAINT "credits_batch_credits_package_id_credits_package_id_fk" FOREIGN KEY ("credits_package_id") REFERENCES "public"."credits_package"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "credits_usage" ADD CONSTRAINT "credits_usage_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "credits_usage" ADD CONSTRAINT "credits_usage_credits_batch_id_credits_batch_id_fk" FOREIGN KEY ("credits_batch_id") REFERENCES "public"."credits_batch"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment" ADD CONSTRAINT "payment_payment_method_id_payment_method_id_fk" FOREIGN KEY ("payment_method_id") REFERENCES "public"."payment_method"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "payment_method" ADD CONSTRAINT "payment_method_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "refund" ADD CONSTRAINT "refund_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_tariff_id_tariff_id_fk" FOREIGN KEY ("tariff_id") REFERENCES "public"."tariff"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tariff" ADD CONSTRAINT "tariff_credits_package_id_credits_package_id_fk" FOREIGN KEY ("credits_package_id") REFERENCES "public"."credits_package"("id") ON DELETE cascade ON UPDATE set null;--> statement-breakpoint
ALTER TABLE "tariff_discount" ADD CONSTRAINT "tariff_discount_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tariff_discount" ADD CONSTRAINT "tariff_discount_tariff_id_tariff_id_fk" FOREIGN KEY ("tariff_id") REFERENCES "public"."tariff"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profiles_from_channels_job" ADD CONSTRAINT "profiles_from_channels_job_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "credits_batch_to_payment" ADD CONSTRAINT "credits_batch_to_payment_credits_batch_id_credits_batch_id_fk" FOREIGN KEY ("credits_batch_id") REFERENCES "public"."credits_batch"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "credits_batch_to_payment" ADD CONSTRAINT "credits_batch_to_payment_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ideas_list_to_export_document" ADD CONSTRAINT "ideas_list_to_export_document_ideas_list_id_ideas_list_id_fk" FOREIGN KEY ("ideas_list_id") REFERENCES "public"."ideas_list"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ideas_list_to_export_document" ADD CONSTRAINT "ideas_list_to_export_document_export_document_id_export_document_id_fk" FOREIGN KEY ("export_document_id") REFERENCES "public"."export_document"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ideas_list_to_tone" ADD CONSTRAINT "ideas_list_to_tone_ideas_list_id_ideas_list_id_fk" FOREIGN KEY ("ideas_list_id") REFERENCES "public"."ideas_list"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ideas_list_to_tone" ADD CONSTRAINT "ideas_list_to_tone_tone_id_tone_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tone"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ideas_list_to_video_type" ADD CONSTRAINT "ideas_list_to_video_type_ideas_list_id_ideas_list_id_fk" FOREIGN KEY ("ideas_list_id") REFERENCES "public"."ideas_list"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ideas_list_to_video_type" ADD CONSTRAINT "ideas_list_to_video_type_video_type_id_video_type_id_fk" FOREIGN KEY ("video_type_id") REFERENCES "public"."video_type"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "platform_to_video_type" ADD CONSTRAINT "platform_to_video_type_platform_id_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "platform_to_video_type" ADD CONSTRAINT "platform_to_video_type_video_type_id_video_type_id_fk" FOREIGN KEY ("video_type_id") REFERENCES "public"."video_type"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_channel_to_profiles_from_channels_job" ADD CONSTRAINT "profile_channel_to_profiles_from_channels_job_profile_channel_id_profile_channel_id_fk" FOREIGN KEY ("profile_channel_id") REFERENCES "public"."profile_channel"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_channel_to_profiles_from_channels_job" ADD CONSTRAINT "profile_channel_to_profiles_from_channels_job_profiles_from_channels_job_id_profiles_from_channels_job_id_fk" FOREIGN KEY ("profiles_from_channels_job_id") REFERENCES "public"."profiles_from_channels_job"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_to_platform" ADD CONSTRAINT "profile_to_platform_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_to_platform" ADD CONSTRAINT "profile_to_platform_platform_id_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_to_profiles_from_channels_job" ADD CONSTRAINT "profile_to_profiles_from_channels_job_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_to_profiles_from_channels_job" ADD CONSTRAINT "profile_to_profiles_from_channels_job_profiles_from_channels_job_id_profiles_from_channels_job_id_fk" FOREIGN KEY ("profiles_from_channels_job_id") REFERENCES "public"."profiles_from_channels_job"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_to_tone" ADD CONSTRAINT "profile_to_tone_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_to_tone" ADD CONSTRAINT "profile_to_tone_tone_id_tone_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tone"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_to_platform" ADD CONSTRAINT "scenario_to_platform_scenario_id_scenario_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenario"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_to_platform" ADD CONSTRAINT "scenario_to_platform_platform_id_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_to_tone" ADD CONSTRAINT "scenario_to_tone_scenario_id_scenario_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenario"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_to_tone" ADD CONSTRAINT "scenario_to_tone_tone_id_tone_id_fk" FOREIGN KEY ("tone_id") REFERENCES "public"."tone"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_version_to_export_document" ADD CONSTRAINT "scenario_version_to_export_document_scenario_version_id_scenario_version_id_fk" FOREIGN KEY ("scenario_version_id") REFERENCES "public"."scenario_version"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_version_to_export_document" ADD CONSTRAINT "scenario_version_to_export_document_export_document_id_export_document_id_fk" FOREIGN KEY ("export_document_id") REFERENCES "public"."export_document"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_to_credits_batch" ADD CONSTRAINT "subscription_to_credits_batch_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_to_credits_batch" ADD CONSTRAINT "subscription_to_credits_batch_credits_batch_id_credits_batch_id_fk" FOREIGN KEY ("credits_batch_id") REFERENCES "public"."credits_batch"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_to_payment" ADD CONSTRAINT "subscription_to_payment_subscription_id_subscription_id_fk" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscription"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_to_payment" ADD CONSTRAINT "subscription_to_payment_next_subscription_id_subscription_id_fk" FOREIGN KEY ("next_subscription_id") REFERENCES "public"."subscription"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "subscription_to_payment" ADD CONSTRAINT "subscription_to_payment_payment_id_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "attachment" ADD CONSTRAINT "attachment_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "export_document" ADD CONSTRAINT "export_document_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "export_document" ADD CONSTRAINT "export_document_format_id_export_document_format_id_fk" FOREIGN KEY ("format_id") REFERENCES "public"."export_document_format"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "export_document" ADD CONSTRAINT "export_document_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "idea" ADD CONSTRAINT "idea_ideas_list_id_ideas_list_id_fk" FOREIGN KEY ("ideas_list_id") REFERENCES "public"."ideas_list"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "idea" ADD CONSTRAINT "idea_video_type_id_video_type_id_fk" FOREIGN KEY ("video_type_id") REFERENCES "public"."video_type"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ideas_list" ADD CONSTRAINT "ideas_list_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ideas_list" ADD CONSTRAINT "ideas_list_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ideas_list" ADD CONSTRAINT "ideas_list_template_id_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."template"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile" ADD CONSTRAINT "profile_type_id_profile_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."profile_type"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_attachment" ADD CONSTRAINT "profile_attachment_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_attachment" ADD CONSTRAINT "profile_attachment_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_channel" ADD CONSTRAINT "profile_channel_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_channel" ADD CONSTRAINT "profile_channel_platform_id_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "profile_channel_video" ADD CONSTRAINT "profile_channel_video_profile_channel_id_profile_channel_id_fk" FOREIGN KEY ("profile_channel_id") REFERENCES "public"."profile_channel"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_profile_id_profile_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_template_id_template_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."template"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_video_type_id_video_type_id_fk" FOREIGN KEY ("video_type_id") REFERENCES "public"."video_type"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_video_duration_id_video_duration_id_fk" FOREIGN KEY ("video_duration_id") REFERENCES "public"."video_duration"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario" ADD CONSTRAINT "scenario_production_status_id_production_status_id_fk" FOREIGN KEY ("production_status_id") REFERENCES "public"."production_status"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_chapter" ADD CONSTRAINT "scenario_chapter_scenario_version_id_scenario_version_id_fk" FOREIGN KEY ("scenario_version_id") REFERENCES "public"."scenario_version"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_chapter" ADD CONSTRAINT "scenario_chapter_production_status_id_production_status_id_fk" FOREIGN KEY ("production_status_id") REFERENCES "public"."production_status"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_metadata" ADD CONSTRAINT "scenario_metadata_scenario_id_scenario_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenario"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_metadata" ADD CONSTRAINT "scenario_metadata_platform_id_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_scene" ADD CONSTRAINT "scenario_scene_scenario_chapter_id_scenario_chapter_id_fk" FOREIGN KEY ("scenario_chapter_id") REFERENCES "public"."scenario_chapter"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_scene_component" ADD CONSTRAINT "scenario_scene_component_type_id_scenario_scene_component_type_id_fk" FOREIGN KEY ("type_id") REFERENCES "public"."scenario_scene_component_type"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_scene_component" ADD CONSTRAINT "scenario_scene_component_scenario_scene_id_scenario_scene_id_fk" FOREIGN KEY ("scenario_scene_id") REFERENCES "public"."scenario_scene"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_scene_preview" ADD CONSTRAINT "scenario_scene_preview_scenario_scene_id_scenario_scene_id_fk" FOREIGN KEY ("scenario_scene_id") REFERENCES "public"."scenario_scene"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_scene_preview" ADD CONSTRAINT "scenario_scene_preview_attachment_id_attachment_id_fk" FOREIGN KEY ("attachment_id") REFERENCES "public"."attachment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_scene_preview" ADD CONSTRAINT "scenario_scene_preview_compressed_attachment_id_attachment_id_fk" FOREIGN KEY ("compressed_attachment_id") REFERENCES "public"."attachment"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_version" ADD CONSTRAINT "scenario_version_scenario_id_scenario_id_fk" FOREIGN KEY ("scenario_id") REFERENCES "public"."scenario"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_video_reference" ADD CONSTRAINT "scenario_video_reference_scenario_version_id_scenario_version_id_fk" FOREIGN KEY ("scenario_version_id") REFERENCES "public"."scenario_version"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "scenario_video_reference" ADD CONSTRAINT "scenario_video_reference_platform_id_platform_id_fk" FOREIGN KEY ("platform_id") REFERENCES "public"."platform"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_code" ADD CONSTRAINT "referral_code_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_code" ADD CONSTRAINT "referral_code_referral_reward_id_referral_reward_id_fk" FOREIGN KEY ("referral_reward_id") REFERENCES "public"."referral_reward"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_referral_source_user_id_user_id_fk" FOREIGN KEY ("referral_source_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_referral_target_user_id_user_id_fk" FOREIGN KEY ("referral_target_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_referral_code_id_referral_code_id_fk" FOREIGN KEY ("referral_code_id") REFERENCES "public"."referral_code"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_credits_batch_id_credits_batch_id_fk" FOREIGN KEY ("credits_batch_id") REFERENCES "public"."credits_batch"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "referral_invite" ADD CONSTRAINT "referral_invite_tariff_discount_id_tariff_discount_id_fk" FOREIGN KEY ("tariff_discount_id") REFERENCES "public"."tariff_discount"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "session" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "session_expires_at_idx" ON "session" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "verification_identifier_value_idx" ON "verification" USING btree ("identifier","value");--> statement-breakpoint
CREATE INDEX "verification_expires_at_idx" ON "verification" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "credits_batch_user_id_created_at_idx" ON "credits_batch" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "credits_batch_user_id_status_expires_at_idx" ON "credits_batch" USING btree ("user_id","status","expires_at");--> statement-breakpoint
CREATE INDEX "credits_batch_credits_package_id_idx" ON "credits_batch" USING btree ("credits_package_id");--> statement-breakpoint
CREATE INDEX "credits_usage_user_id_created_at_idx" ON "credits_usage" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "credits_usage_batch_id_idx" ON "credits_usage" USING btree ("credits_batch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_external_id_unique_idx" ON "payment" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "payment_external_id_idx" ON "payment" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "payment_user_id_created_at_idx" ON "payment" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "payment_user_id_status_created_at_idx" ON "payment" USING btree ("user_id","status","created_at");--> statement-breakpoint
CREATE INDEX "payment_payment_method_id_idx" ON "payment" USING btree ("payment_method_id");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_method_external_id_unique_idx" ON "payment_method" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "payment_method_external_id_idx" ON "payment_method" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "payment_method_user_id_created_at_idx" ON "payment_method" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "payment_method_user_id_status_created_at_idx" ON "payment_method" USING btree ("user_id","status","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "payment_method_user_default_unique_idx" ON "payment_method" USING btree ("user_id") WHERE "payment_method"."default" = true;--> statement-breakpoint
CREATE INDEX "subscription_user_id_starts_at_idx" ON "subscription" USING btree ("user_id","starts_at");--> statement-breakpoint
CREATE INDEX "subscription_user_id_cycle_ends_at_created_at_idx" ON "subscription" USING btree ("user_id","cycle_ends_at","created_at");--> statement-breakpoint
CREATE INDEX "subscription_tariff_id_idx" ON "subscription" USING btree ("tariff_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_user_current_unique_idx" ON "subscription" USING btree ("user_id") WHERE "subscription"."status" in ('active', 'overdue', 'cancelled');--> statement-breakpoint
CREATE INDEX "profiles_from_channels_job_user_id_created_at_idx" ON "profiles_from_channels_job" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "credits_batch_to_payment_credits_batch_id_idx" ON "credits_batch_to_payment" USING btree ("credits_batch_id");--> statement-breakpoint
CREATE UNIQUE INDEX "credits_batch_to_payment_payment_id_unique_idx" ON "credits_batch_to_payment" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "credits_batch_to_payment_payment_id_idx" ON "credits_batch_to_payment" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "ideas_list_to_export_document_list_saved_created_idx" ON "ideas_list_to_export_document" USING btree ("ideas_list_id","saved_only","created_at");--> statement-breakpoint
CREATE INDEX "ideas_list_to_export_document_list_export_idx" ON "ideas_list_to_export_document" USING btree ("ideas_list_id","export_document_id");--> statement-breakpoint
CREATE INDEX "ideas_list_to_tone_ideas_list_id_idx" ON "ideas_list_to_tone" USING btree ("ideas_list_id");--> statement-breakpoint
CREATE INDEX "ideas_list_to_tone_tone_id_ideas_list_id_idx" ON "ideas_list_to_tone" USING btree ("tone_id","ideas_list_id");--> statement-breakpoint
CREATE INDEX "ideas_list_to_video_type_ideas_list_id_idx" ON "ideas_list_to_video_type" USING btree ("ideas_list_id");--> statement-breakpoint
CREATE INDEX "ideas_list_to_video_type_video_type_id_ideas_list_id_idx" ON "ideas_list_to_video_type" USING btree ("video_type_id","ideas_list_id");--> statement-breakpoint
CREATE INDEX "profile_to_platform_profile_id_platform_id_idx" ON "profile_to_platform" USING btree ("profile_id","platform_id");--> statement-breakpoint
CREATE INDEX "profile_to_tone_profile_id_tone_id_idx" ON "profile_to_tone" USING btree ("profile_id","tone_id");--> statement-breakpoint
CREATE INDEX "scenario_to_platform_scenario_id_idx" ON "scenario_to_platform" USING btree ("scenario_id");--> statement-breakpoint
CREATE INDEX "scenario_to_platform_platform_id_scenario_id_idx" ON "scenario_to_platform" USING btree ("platform_id","scenario_id");--> statement-breakpoint
CREATE INDEX "scenario_to_tone_scenario_id_idx" ON "scenario_to_tone" USING btree ("scenario_id");--> statement-breakpoint
CREATE INDEX "scenario_to_tone_tone_id_scenario_id_idx" ON "scenario_to_tone" USING btree ("tone_id","scenario_id");--> statement-breakpoint
CREATE INDEX "scenario_version_to_export_document_version_created_idx" ON "scenario_version_to_export_document" USING btree ("scenario_version_id","created_at");--> statement-breakpoint
CREATE INDEX "scenario_version_to_export_document_version_export_idx" ON "scenario_version_to_export_document" USING btree ("scenario_version_id","export_document_id");--> statement-breakpoint
CREATE INDEX "subscription_to_credits_batch_subscription_id_idx" ON "subscription_to_credits_batch" USING btree ("subscription_id");--> statement-breakpoint
CREATE INDEX "subscription_to_credits_batch_credits_batch_id_idx" ON "subscription_to_credits_batch" USING btree ("credits_batch_id");--> statement-breakpoint
CREATE INDEX "subscription_to_payment_subscription_id_idx" ON "subscription_to_payment" USING btree ("subscription_id");--> statement-breakpoint
CREATE UNIQUE INDEX "subscription_to_payment_payment_id_unique_idx" ON "subscription_to_payment" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "subscription_to_payment_payment_id_idx" ON "subscription_to_payment" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "idea_ideas_list_id_created_at_idx" ON "idea" USING btree ("ideas_list_id","created_at");--> statement-breakpoint
CREATE INDEX "ideas_list_user_id_created_at_idx" ON "ideas_list" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "ideas_list_user_id_updated_at_idx" ON "ideas_list" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "ideas_list_profile_id_idx" ON "ideas_list" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "ideas_list_template_id_idx" ON "ideas_list" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "profile_user_id_created_at_idx" ON "profile" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "profile_type_id_idx" ON "profile" USING btree ("type_id");--> statement-breakpoint
CREATE INDEX "scenario_user_id_created_at_idx" ON "scenario" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "scenario_user_id_updated_at_idx" ON "scenario" USING btree ("user_id","updated_at");--> statement-breakpoint
CREATE INDEX "scenario_user_id_scheduled_start_at_idx" ON "scenario" USING btree ("user_id","scheduled_start_at");--> statement-breakpoint
CREATE INDEX "scenario_profile_id_idx" ON "scenario" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX "scenario_template_id_idx" ON "scenario" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "scenario_video_type_id_idx" ON "scenario" USING btree ("video_type_id");--> statement-breakpoint
CREATE INDEX "scenario_video_duration_id_idx" ON "scenario" USING btree ("video_duration_id");--> statement-breakpoint
CREATE INDEX "scenario_production_status_id_idx" ON "scenario" USING btree ("production_status_id");--> statement-breakpoint
CREATE INDEX "scenario_chapter_version_id_start_time_idx" ON "scenario_chapter" USING btree ("scenario_version_id","start_time");--> statement-breakpoint
CREATE INDEX "scenario_chapter_production_status_id_idx" ON "scenario_chapter" USING btree ("production_status_id");--> statement-breakpoint
CREATE INDEX "scenario_metadata_scenario_id_platform_id_idx" ON "scenario_metadata" USING btree ("scenario_id","platform_id");--> statement-breakpoint
CREATE INDEX "scenario_scene_chapter_id_start_time_idx" ON "scenario_scene" USING btree ("scenario_chapter_id","start_time");--> statement-breakpoint
CREATE INDEX "scenario_scene_component_scene_id_created_at_idx" ON "scenario_scene_component" USING btree ("scenario_scene_id","created_at");--> statement-breakpoint
CREATE INDEX "scenario_scene_component_type_id_idx" ON "scenario_scene_component" USING btree ("type_id");--> statement-breakpoint
CREATE INDEX "scenario_scene_preview_scene_id_idx" ON "scenario_scene_preview" USING btree ("scenario_scene_id");--> statement-breakpoint
CREATE INDEX "scenario_version_scenario_id_created_at_idx" ON "scenario_version" USING btree ("scenario_id","created_at");--> statement-breakpoint
CREATE INDEX "referral_code_user_id_created_at_idx" ON "referral_code" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "referral_code_reward_id_idx" ON "referral_code" USING btree ("referral_reward_id");--> statement-breakpoint
CREATE INDEX "referral_invite_source_user_created_at_idx" ON "referral_invite" USING btree ("referral_source_user_id","created_at");--> statement-breakpoint
CREATE INDEX "referral_invite_source_user_updated_at_idx" ON "referral_invite" USING btree ("referral_source_user_id","updated_at");--> statement-breakpoint
CREATE INDEX "referral_invite_target_user_id_idx" ON "referral_invite" USING btree ("referral_target_user_id");--> statement-breakpoint
CREATE INDEX "referral_invite_code_id_idx" ON "referral_invite" USING btree ("referral_code_id");--> statement-breakpoint
CREATE INDEX "alert_status_expires_at_created_at_idx" ON "alert" USING btree ("status","expires_at","created_at");