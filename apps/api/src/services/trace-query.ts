import { prisma } from "@terrax/database";

export async function getTrace(
  projectId: string,
  traceId: string,
) {
  return prisma.trace.findUnique({
    where: {
      projectId_traceId: {
        projectId,
        traceId,
      },
    },
    select: {
      traceId: true,
      createdAt: true,
      spans: {
        select: {
          traceId: true,
          spanId: true,
          parentSpanId: true,
          name: true,
          startTime: true,
          endTime: true,
          status: true,
          attributes: true,
          events: true,
          resource: true,
        },
        orderBy: {
          startTime: "asc",
        },
      },
    },
  });
}