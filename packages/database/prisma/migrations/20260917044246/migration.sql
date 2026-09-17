-- AlterTable
ALTER TABLE "api_keys" ADD COLUMN     "keyPrefix" TEXT,
ADD COLUMN     "lastUsedAt" TIMESTAMP(3),
ADD COLUMN     "name" TEXT,
ADD COLUMN     "revokedAt" TIMESTAMP(3);
