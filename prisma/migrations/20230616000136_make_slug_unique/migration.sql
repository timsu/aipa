/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `workspace_invites` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "workspace_invites_slug_key" ON "workspace_invites"("slug");
