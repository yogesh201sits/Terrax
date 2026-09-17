import { auth } from "@clerk/nextjs/server";
import {
  Activity,
  FolderKanban,
  Layers3,
  Sparkles,
} from "lucide-react";

import { getProjects } from "@/lib/api/projects";
import { ProjectsList } from "@/components/projects/projects-list";
import { CreateProject } from "@/components/projects/create-project";
import { ProjectsClient } from "@/components/projects/projects-client";

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
    <ProjectsClient>
      <div className="relative min-h-full overflow-hidden bg-background">
        {/* Background atmosphere */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-180px] h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/[0.035] blur-3xl" />

          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1280px] px-6 py-10 lg:px-8">
          {/* Hero */}
          <header className="mb-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5">
                  <Sparkles className="size-3.5" />

                  <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
                    TERRAX WORKSPACE
                  </span>
                </div>

                <h1 className="text-3xl font-semibold tracking-[-0.03em] sm:text-4xl">
                  Projects
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Manage your AI applications, telemetry environments,
                  and observability data from one place.
                </p>
              </div>
            </div>
          </header>

          {/* Workspace stats */}
          <section className="mb-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border bg-card/70 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FolderKanban className="size-4" />
                <span className="text-xs">
                  Total projects
                </span>
              </div>

              <p className="mt-3 text-2xl font-semibold tracking-tight">
                {projects.length}
              </p>
            </div>

            <div className="rounded-xl border bg-card/70 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers3 className="size-4" />
                <span className="text-xs">
                  Telemetry source
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold">
                OpenTelemetry
              </p>

              <p className="mt-1 text-[11px] text-muted-foreground">
                Traces · spans · attributes
              </p>
            </div>

            <div className="rounded-xl border bg-card/70 p-4 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="size-4" />
                <span className="text-xs">
                  Observability
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold">
                AI Agent Monitoring
              </p>

              <p className="mt-1 text-[11px] text-muted-foreground">
                LLMs · tools · workflows
              </p>
            </div>
          </section>

          {/* Main content */}
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-sm font-semibold">
                  Your projects
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Create and manage your Terrax environments.
                </p>
              </div>

              <span className="rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {projects.length}{" "}
                {projects.length === 1
                  ? "project"
                  : "projects"}
              </span>
            </div>

            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              {/* Create */}
              <div className="lg:sticky lg:top-6 lg:self-start">
                <CreateProject />
              </div>

              {/* Existing projects */}
              <ProjectsList projects={projects} />
            </div>
          </section>
        </div>
      </div>
    </ProjectsClient>
  );
}
