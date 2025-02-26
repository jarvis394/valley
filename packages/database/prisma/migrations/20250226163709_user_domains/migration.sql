/*
  Warnings:

  - You are about to drop the column `domain` on the `UserSettings` table. All the data in the column will be lost.
  - You are about to drop the column `serviceDomain` on the `UserSettings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "domain",
DROP COLUMN "serviceDomain";

-- CreateTable
CREATE TABLE "UserDomain" (
    "domain" TEXT NOT NULL,
    "isServiceDomain" BOOLEAN NOT NULL DEFAULT true,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDomain_domain_key" ON "UserDomain"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "UserDomain_userId_key" ON "UserDomain"("userId");

-- AddForeignKey
ALTER TABLE "UserDomain" ADD CONSTRAINT "UserDomain_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
