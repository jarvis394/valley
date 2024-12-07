-- AlterTable
ALTER TABLE "_PermissionToRole" ADD CONSTRAINT "_PermissionToRole_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_PermissionToRole_AB_unique";

-- AlterTable
ALTER TABLE "_RoleToUser" ADD CONSTRAINT "_RoleToUser_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_RoleToUser_AB_unique";

-- CreateTable
CREATE TABLE "UploadToken" (
    "hash" TEXT NOT NULL,
    "uploadProjectId" TEXT NOT NULL,
    "uploadFolderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "UploadToken_hash_key" ON "UploadToken"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "UploadToken_uploadProjectId_key" ON "UploadToken"("uploadProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "UploadToken_uploadFolderId_key" ON "UploadToken"("uploadFolderId");

-- CreateIndex
CREATE UNIQUE INDEX "UploadToken_userId_key" ON "UploadToken"("userId");

-- AddForeignKey
ALTER TABLE "UploadToken" ADD CONSTRAINT "UploadToken_uploadProjectId_fkey" FOREIGN KEY ("uploadProjectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadToken" ADD CONSTRAINT "UploadToken_uploadFolderId_fkey" FOREIGN KEY ("uploadFolderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadToken" ADD CONSTRAINT "UploadToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
