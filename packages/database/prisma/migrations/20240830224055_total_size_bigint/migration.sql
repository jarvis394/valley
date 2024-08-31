/*
  Warnings:

  - Added the required column `projectId` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "projectId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "totalSize" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Project" ALTER COLUMN "totalSize" SET DATA TYPE BIGINT;
