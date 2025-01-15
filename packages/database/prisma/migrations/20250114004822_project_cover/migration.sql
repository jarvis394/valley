/*
  Warnings:

  - You are about to drop the column `totalFiles` on the `Folder` table. All the data in the column will be lost.
  - You are about to drop the column `totalSize` on the `Folder` table. All the data in the column will be lost.
  - You are about to drop the column `totalFiles` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `totalSize` on the `Project` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Folder" DROP COLUMN "totalFiles",
DROP COLUMN "totalSize";

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "totalFiles",
DROP COLUMN "totalSize";

-- CreateTable
CREATE TABLE "Cover" (
    "id" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "y" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "fileId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Cover_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cover_projectId_key" ON "Cover"("projectId");

-- AddForeignKey
ALTER TABLE "Cover" ADD CONSTRAINT "Cover_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cover" ADD CONSTRAINT "Cover_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;
