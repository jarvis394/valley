ALTER TABLE "users" ALTER COLUMN "domains" SET NOT NULL;
ALTER TABLE "users" ADD COLUMN "onboarded" boolean DEFAULT false NOT NULL;