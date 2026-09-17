-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE INDEX "projects_userId_idx" ON "projects"("userId");
