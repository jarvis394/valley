-- CreateIndex
CREATE INDEX "File_dateCreated_isPendingDeletion_idx" ON "File"("dateCreated", "isPendingDeletion");

-- CreateIndex
CREATE INDEX "Project_dateCreated_dateUpdated_dateShot_totalSize_idx" ON "Project"("dateCreated", "dateUpdated", "dateShot", "totalSize");
