/*
  Warnings:

  - You are about to drop the `UserDomain` table. If the table is not empty, all the data it contains will be lost.
  - The required column `serviceDomain` was added to the `User` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "UserDomain" DROP CONSTRAINT "UserDomain_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "domains" TEXT[],
ADD COLUMN     "serviceDomain" TEXT NOT NULL;

-- DropTable
DROP TABLE "UserDomain";
