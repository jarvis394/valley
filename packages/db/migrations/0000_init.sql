CREATE TYPE "public"."asset_kind" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('private', 'public');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"avatar" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "assets" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"kind" "asset_kind" NOT NULL,
	"name" text NOT NULL,
	"content_type" text NOT NULL,
	"size" bigint NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"original_key" text NOT NULL,
	"preview_key" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "assets_original_key_unique" UNIQUE("original_key"),
	CONSTRAINT "assets_preview_key_unique" UNIQUE("preview_key")
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"shot_on" text NOT NULL,
	"visibility" "visibility" DEFAULT 'private' NOT NULL,
	"protected" boolean DEFAULT false NOT NULL,
	"cover" text,
	"asset_count" integer DEFAULT 0 NOT NULL,
	"doc" jsonb NOT NULL,
	"settings" jsonb NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"new_favorites" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "projects_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "assets" ADD CONSTRAINT "assets_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "assets_project_idx" ON "assets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "projects_account_idx" ON "projects" USING btree ("account_id","shot_on");