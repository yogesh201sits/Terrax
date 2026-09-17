import { auth } from "@clerk/nextjs/server";

import { getProjects } from "@/lib/api/projects";
import { getTraces } from "@/lib/api/traces";
import { TraceTable } from "@/components/traces/trace-table";

type Props = {
  searchParams: Promise<{
    projectId?: string;
  }>;
};

export default async function TracesPage({
  searchParams,
}: Props) {
  const { projectId } = await searchParams;

  const { userId, getToken } = await auth();

  if (!userId) {
    return null;
  }

  const token = await getToken();

  if (!token) {
    throw new Error("Unable to get Clerk token");
  }

  const { projects } = await getProjects(token);

  const activeProject =
    projects.find(
      (project) => project.id === projectId,
    ) ?? projects[0];

  if (!activeProject) {
    throw new Error("No project found");
  }

  const { traces } = await getTraces(
    activeProject.id,
    token,
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Traces
        </h1>

        <p className="text-sm text-muted-foreground">
          Explore AI agent executions and OpenTelemetry traces.
        </p>
      </div>

      {traces.length === 0 ? (
        <div className="rounded-lg border p-12 text-center">
          <p className="text-sm text-muted-foreground">
            No traces found.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <TraceTable
            traces={traces}
            projectId={activeProject.id}
          />
        </div>
      )}
    </div>
  );
}
