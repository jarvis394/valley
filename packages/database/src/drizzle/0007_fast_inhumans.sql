ALTER TABLE "filePositions" RENAME TO "file_positions";
ALTER TABLE "file_positions" DROP CONSTRAINT "filePositions_folder_id_folders_id_fk";

ALTER TABLE "file_positions" DROP CONSTRAINT "filePositions_file_id_files_id_fk";

ALTER TABLE "file_positions" DROP CONSTRAINT "filePositions_folder_id_file_id_pk";
ALTER TABLE "file_positions" ADD CONSTRAINT "file_positions_folder_id_file_id_pk" PRIMARY KEY("folder_id","file_id");
ALTER TABLE "file_positions" ADD CONSTRAINT "file_positions_folder_id_folders_id_fk" FOREIGN KEY ("folder_id") REFERENCES "public"."folders"("id") ON DELETE cascade ON UPDATE cascade;
ALTER TABLE "file_positions" ADD CONSTRAINT "file_positions_file_id_files_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."files"("id") ON DELETE cascade ON UPDATE cascade;