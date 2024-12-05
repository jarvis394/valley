/*
  Warnings:

  - A unique constraint covering the columns `[url]` on the table `Project` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Project_url_key" ON "Project"("url");
