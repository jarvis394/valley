/*
  Warnings:

  - You are about to drop the column `noteId` on the `Tag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Tag" DROP CONSTRAINT "Tag_noteId_fkey";

-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "noteId";

-- CreateTable
CREATE TABLE "TagsOnNotes" (
    "noteId" INTEGER NOT NULL,
    "tagId" INTEGER NOT NULL,

    CONSTRAINT "TagsOnNotes_pkey" PRIMARY KEY ("noteId","tagId")
);

-- AddForeignKey
ALTER TABLE "TagsOnNotes" ADD CONSTRAINT "TagsOnNotes_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TagsOnNotes" ADD CONSTRAINT "TagsOnNotes_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
