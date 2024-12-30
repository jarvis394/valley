-- DropIndex
DROP INDEX "User_username_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "interfaceLanguage" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "phone" TEXT;
