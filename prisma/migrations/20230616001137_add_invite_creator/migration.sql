/*
  Warnings:

  - Added the required column `creatorId` to the `workspace_invites` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "workspace_invites" ADD COLUMN     "creatorId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "workspace_invites" ADD CONSTRAINT "workspace_invites_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
