-- AlterTable
ALTER TABLE "Folder" ADD COLUMN     "totalFiles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSize" TEXT NOT NULL DEFAULT '0';

-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "totalFiles" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSize" TEXT NOT NULL DEFAULT '0';
