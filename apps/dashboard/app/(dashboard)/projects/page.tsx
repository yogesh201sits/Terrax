import { auth } from "@clerk/nextjs/server";
import {
  Activity,
  FolderKanban,
  Layers3,
  Sparkles,
} from "lucide-react";

import { getProjects } from "@/lib/api/projects";
import { CreateProject } from "@/components/projects/create-project";
import { ProjectsClient } from "@/components/projects/projects-client";
import { ProjectsList } from "@/components/projects/projects-list";

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
            className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage:
                "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-[1280px] px-6 py-10 lg:px-8">
          {/* Hero */}
          <header className="mb-9">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1.5">
              <Sparkles className="size-3.5" />

              <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
                TERRAX WORKSPACE
              </span>
            </div>

            <h1 className="text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">
              Projects
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              Manage your AI applications, telemetry environments, and
              observability data from one place.
            </p>
          </header>

          {/* Workspace stats */}
          <section className="mb-8 grid gap-2.5 sm:grid-cols-3">
            <div className="rounded-lg border bg-card/70 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <FolderKanban className="size-3.5" />
                <span className="text-[11px]">Total projects</span>
              </div>

              <p className="mt-2 text-xl font-semibold tracking-tight">
                {projects.length}
              </p>
            </div>

            <div className="rounded-lg border bg-card/70 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Layers3 className="size-3.5" />
                <span className="text-[11px]">Telemetry source</span>
              </div>

              <p className="mt-2 text-sm font-semibold">OpenTelemetry</p>

              <p className="mt-0.5 text-[10px] text-muted-foreground">
                Traces · spans · attributes
              </p>
            </div>

            <div className="rounded-lg border bg-card/70 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Activity className="size-3.5" />
                <span className="text-[11px]">Observability</span>
              </div>

              <p className="mt-2 text-sm font-semibold">
                AI Agent Monitoring
              </p>

              <p className="mt-0.5 text-[10px] text-muted-foreground">
                LLMs · tools · workflows
              </p>
            </div>
          </section>

          {/* Create project */}
          <section className="mb-8">
            <div className="mb-3">
              <h2 className="text-sm font-semibold tracking-tight">
                Create a project
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Set up a new environment to start collecting telemetry.
              </p>
            </div>

            <div className="relative overflow-hidden rounded-xl border bg-card shadow-sm">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

              <div className="px-4 py-3">
                <CreateProject />
              </div>
            </div>
          </section>
          {/* Existing projects */}
          <section>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-sm font-semibold tracking-tight">
                  Your projects
                </h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Create and manage your Terrax environments.
                </p>
              </div>

              <span className="rounded-full border bg-muted/40 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                {projects.length}{" "}
                {projects.length === 1 ? "project" : "projects"}
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <ProjectsList projects={projects} />
            </div>
          </section>
        </div>
      </div>
    </ProjectsClient>
  );
}
