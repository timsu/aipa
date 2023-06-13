-- CreateTable
CREATE TABLE "project_validations" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "rules" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_validations_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "project_validations" ADD CONSTRAINT "project_validations_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
