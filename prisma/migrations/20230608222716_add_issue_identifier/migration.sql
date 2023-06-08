-- DropIndex
DROP INDEX "issues_projectId_number_idx";

-- AlterTable
ALTER TABLE "issues" ADD COLUMN     "identifier" VARCHAR(20) NOT NULL DEFAULT '';

-- CreateIndex
CREATE INDEX "issues_projectId_identifier_idx" ON "issues"("projectId", "identifier");
