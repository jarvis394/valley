CREATE TABLE "filePositions" (
	"folder_id" varchar NOT NULL,
	"file_id" varchar NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "filePositions_folder_id_file_id_pk" PRIMARY KEY("folder_id","file_id")
);

ALTER TABLE "filePositions" ADD CONSTRAINT "filePositions_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "filePositions" ADD CONSTRAINT "filePositions_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE cascade;