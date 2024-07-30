/*
  Warnings:

  - Added the required column `translationStringsId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "translationStringsId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "TranslationStrings" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "projectId" INTEGER NOT NULL,

    CONSTRAINT "TranslationStrings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TranslationStrings_projectId_key" ON "TranslationStrings"("projectId");

-- AddForeignKey
ALTER TABLE "TranslationStrings" ADD CONSTRAINT "TranslationStrings_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
