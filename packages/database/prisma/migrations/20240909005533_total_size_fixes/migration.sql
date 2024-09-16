/*
  Warnings:

  - The `storedUntil` column on the `Project` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "File" ALTER COLUMN "size" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "totalSize" SET DEFAULT '0',
ALTER COLUMN "totalSize" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "storedUntil",
ADD COLUMN     "storedUntil" TIMESTAMP(3),
ALTER COLUMN "totalSize" SET DEFAULT '0',
ALTER COLUMN "totalSize" SET DATA TYPE TEXT;
