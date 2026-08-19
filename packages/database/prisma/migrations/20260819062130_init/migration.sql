-- CreateTable
CREATE TABLE "Trace" (
    "id" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Span" (
    "id" TEXT NOT NULL,
    "spanId" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Span_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Trace_traceId_key" ON "Trace"("traceId");

-- CreateIndex
CREATE UNIQUE INDEX "Span_spanId_key" ON "Span"("spanId");

-- CreateIndex
CREATE INDEX "Span_traceId_idx" ON "Span"("traceId");

-- AddForeignKey
ALTER TABLE "Span" ADD CONSTRAINT "Span_traceId_fkey" FOREIGN KEY ("traceId") REFERENCES "Trace"("traceId") ON DELETE CASCADE ON UPDATE CASCADE;
