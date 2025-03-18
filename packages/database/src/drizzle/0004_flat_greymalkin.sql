CREATE TABLE "passkeys" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar,
	"public_key" varchar NOT NULL,
	"credential_id" varchar NOT NULL,
	"counter" integer NOT NULL,
	"device_type" varchar NOT NULL,
	"transports" varchar NOT NULL,
	"backed_up" boolean NOT NULL,
	"user_id" varchar NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);

ALTER TABLE "passkeys" ADD CONSTRAINT "passkeys_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;