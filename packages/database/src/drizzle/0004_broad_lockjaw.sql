ALTER TABLE "files" DROP COLUMN "cover_id";
ALTER TABLE "projects" DROP COLUMN "cover_id";
ALTER TABLE "covers" ADD CONSTRAINT "covers_projectId_unique" UNIQUE("project_id");
ALTER TABLE "covers" ADD CONSTRAINT "covers_fileId_unique" UNIQUE("file_id");