import { prisma } from "@terrax/database";
import type { Prisma } from "@terrax/database";
import type { NormalizedTrace } from "@terrax/otel";

export async function ingestTraces(
  projectId: string,
  traces: NormalizedTrace[],
): Promise<void> {
  for (const trace of traces) {
    const storedTrace = await prisma.trace.upsert({
      where: {
        projectId_traceId: {
          projectId,
          traceId: trace.traceId,
        },
      },
      create: {
        projectId,
        traceId: trace.traceId,
      },
      update: {},
    });

    for (const span of trace.spans) {
      await prisma.span.upsert({
        where: {
          traceId_spanId: {
            traceId: span.traceId,
            spanId: span.spanId,
          },
        },
        create: {
          traceId: span.traceId,
          spanId: span.spanId,
          parentSpanId: span.parentSpanId,
          name: span.name,
          startTime: span.startTime,
          endTime: span.endTime,
          status: span.status,
          attributes: span.attributes as unknown as Prisma.InputJsonValue,
          events: span.events as unknown as Prisma.InputJsonValue,
          resource: span.resource as unknown as Prisma.InputJsonValue,
          traceIdRef: storedTrace.id,
        },
        update: {
          parentSpanId: span.parentSpanId,
          name: span.name,
          startTime: span.startTime,
          endTime: span.endTime,
          status: span.status,
          attributes: span.attributes as unknown as Prisma.InputJsonValue,
          events: span.events as unknown as Prisma.InputJsonValue,
          resource: span.resource as unknown as Prisma.InputJsonValue,
        },
      });
    }
  }
}