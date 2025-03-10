ALTER TABLE "covers" DROP CONSTRAINT "covers_file_id_project_id_pk";
ALTER TABLE "users" ALTER COLUMN "domains" SET DEFAULT '{}'::varchar[];
ALTER TABLE "users" ALTER COLUMN "service_domain" SET DEFAULT 'v6wbglx8otq1u3djh10k5ms4';
ALTER TABLE "covers" ADD COLUMN "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;