-- DropForeignKey
ALTER TABLE "UploadToken" DROP CONSTRAINT "UploadToken_uploadFolderId_fkey";

-- DropForeignKey
ALTER TABLE "UploadToken" DROP CONSTRAINT "UploadToken_uploadProjectId_fkey";

-- DropForeignKey
ALTER TABLE "UploadToken" DROP CONSTRAINT "UploadToken_userId_fkey";
