/*
  Warnings:

  - You are about to drop the `Span` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Trace` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Span" DROP CONSTRAINT "Span_traceId_fkey";

-- DropTable
DROP TABLE "Span";

-- DropTable
DROP TABLE "Trace";

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "traces" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "traces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spans" (
    "id" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "spanId" TEXT NOT NULL,
    "parentSpanId" TEXT,
    "name" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "status" JSONB,
    "attributes" JSONB,
    "events" JSONB,
    "resource" JSONB,
    "traceIdRef" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "api_keys_projectId_idx" ON "api_keys"("projectId");

-- CreateIndex
CREATE INDEX "traces_projectId_idx" ON "traces"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "traces_projectId_traceId_key" ON "traces"("projectId", "traceId");

-- CreateIndex
CREATE INDEX "spans_traceId_idx" ON "spans"("traceId");

-- CreateIndex
CREATE INDEX "spans_parentSpanId_idx" ON "spans"("parentSpanId");

-- CreateIndex
CREATE INDEX "spans_traceIdRef_idx" ON "spans"("traceIdRef");

-- CreateIndex
CREATE UNIQUE INDEX "spans_traceId_spanId_key" ON "spans"("traceId", "spanId");

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "traces" ADD CONSTRAINT "traces_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spans" ADD CONSTRAINT "spans_traceIdRef_fkey" FOREIGN KEY ("traceIdRef") REFERENCES "traces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
