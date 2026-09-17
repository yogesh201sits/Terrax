import { auth } from "@clerk/nextjs/server";

import { getProjects } from "@/lib/api/projects";
import { ProjectsList } from "@/components/projects/projects-list";
import { CreateProject } from "@/components/projects/create-project";

export default async function ProjectsPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    return null;
  }

  const token = await getToken();

  if (!token) {
    throw new Error("Unable to get Clerk token");
  }

  const { projects } = await getProjects(token);

  return (
    <div className="min-h-full bg-background">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">
            Projects
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage your Terrax projects and telemetry environments.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          <CreateProject />

          <ProjectsList projects={projects} />
        </div>
      </div>
    </div>
  );
}