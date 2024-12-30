/*
  Warnings:

  - You are about to drop the column `interfaceLanguage` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `User` table. All the data in the column will be lost.
  - Added the required column `fullname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "interfaceLanguage",
DROP COLUMN "phone",
DROP COLUMN "username",
ADD COLUMN     "fullname" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserSettings" (
    "domain" TEXT,
    "serviceDomain" TEXT NOT NULL,
    "interfaceLanguage" TEXT NOT NULL DEFAULT 'en',
    "phone" TEXT,
    "website" TEXT,
    "telegram" TEXT,
    "whatsapp" TEXT,
    "vk" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "vimeo" TEXT,
    "youtube" TEXT,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
