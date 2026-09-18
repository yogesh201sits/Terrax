"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Copy,
  FolderKanban,
  Trash2,
} from "lucide-react";

import { toast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const API_URL =
  process.env.NEXT_PUBLIC_TERRAX_API_URL ??
  "http://localhost:3000";

type Project = {
  id: string;
  name: string;
  createdAt: string;
};

type ProjectsListProps = {
  projects: Project[];
};

export function ProjectsList({
  projects: initialProjects,
}: ProjectsListProps) {
  const { getToken } = useAuth();
  const router = useRouter();

  const [projects, setProjects] =
    useState<Project[]>(initialProjects);

  const [deleteDialogOpen, setDeleteDialogOpen] =
    useState(false);

  const [selectedProjectId, setSelectedProjectId] =
    useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);

  function openDeleteDialog(projectId: string) {
    setSelectedProjectId(projectId);
    setDeleteDialogOpen(true);
  }

  async function deleteProject() {
    if (!selectedProjectId) {
      return;
    }

    setDeleting(true);

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Unable to get Clerk token");
      }

      const response = await fetch(
        `${API_URL}/v1/projects/${selectedProjectId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `Failed to delete project: ${response.status} ${body}`,
        );
      }

      setProjects((current) =>
        current.filter(
          (project) =>
            project.id !== selectedProjectId,
        ),
      );

      setDeleteDialogOpen(false);
      setSelectedProjectId(null);

      toast.add({
        title: "Project deleted",
        description:
          "The project has been deleted successfully.",
        type: "success",
      });

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.add({
        title: "Failed to delete project",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while deleting the project.",
        type: "error",
      });
    } finally {
      setDeleting(false);
    }
  }

  async function copyProjectId(projectId: string) {
    try {
      await navigator.clipboard.writeText(projectId);

      toast.add({
        title: "Project ID copied",
        type: "success",
      });
    } catch (error) {
      console.error(error);

      toast.add({
        title: "Failed to copy project ID",
        type: "error",
      });
    }
  }

  function openProject(projectId: string) {
    router.push(
      `/overview?projectId=${encodeURIComponent(projectId)}`,
    );
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-xl border bg-card">
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
          <div className="flex size-12 items-center justify-center rounded-xl border bg-muted/50">
            <FolderKanban className="size-5 text-muted-foreground" />
          </div>

          <h2 className="mt-4 text-sm font-semibold">
            No projects yet
          </h2>

          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Create your first project to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="group rounded-xl border bg-card transition-colors hover:border-foreground/20"
          >
            <div className="flex items-center gap-4 p-4">
              {/* Icon */}
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                <FolderKanban className="size-4.5 text-muted-foreground" />
              </div>

              {/* Project info */}
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-medium">
                  {project.name}
                </h3>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="size-3" />

                    {new Date(project.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      copyProjectId(project.id)
                    }
                    className="flex max-w-[220px] items-center gap-1 font-mono text-[10px] hover:text-foreground"
                    title="Copy project ID"
                  >
                    <span className="truncate">
                      {project.id}
                    </span>

                    <Copy className="size-3 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    openDeleteDialog(project.id)
                  }
                  className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  title="Delete project"
                >
                  <Trash2 className="size-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openProject(project.id)
                  }
                  className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background transition-opacity hover:opacity-90"
                >
                  Open
                  <ArrowUpRight className="size-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete project?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. All telemetry
              associated with this project may become
              inaccessible.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={deleteProject}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
