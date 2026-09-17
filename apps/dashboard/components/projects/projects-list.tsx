"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Project } from "@/lib/api/projects";
import { useProjectStore } from "@/store/project-store";

const API_URL =
  process.env.NEXT_PUBLIC_TERRAX_API_URL ??
  "http://localhost:3000";

type ProjectsListProps = {
  projects: Project[];
};

export function ProjectsList({
  projects: initialProjects,
}: ProjectsListProps) {
  const { getToken } = useAuth();
  const router = useRouter();

  const setActiveProject = useProjectStore(
    (state) => state.setActiveProject,
  );

  const [projects, setProjects] =
    useState(initialProjects);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [editingName, setEditingName] =
    useState("");

  const [loadingId, setLoadingId] =
    useState<string | null>(null);

  const [error, setError] = useState("");

  function openProject(project: Project) {
    setActiveProject(project);

    router.push(
      `/overview?projectId=${encodeURIComponent(
        project.id,
      )}`,
    );
  }

  function startEditing(project: Project) {
    setEditingId(project.id);
    setEditingName(project.name);
    setError("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
  }

  async function renameProject(
    projectId: string,
  ) {
    const name = editingName.trim();

    if (!name) {
      setError("Project name is required");
      return;
    }

    setLoadingId(projectId);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Unable to get Clerk token");
      }

      const response = await fetch(
        `${API_URL}/v1/projects/${projectId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name }),
        },
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `Failed to rename project: ${response.status} ${body}`,
        );
      }

      const data = await response.json();

      setProjects((current) =>
        current.map((project) =>
          project.id === projectId
            ? data.project
            : project,
        ),
      );

      cancelEditing();

      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to rename project",
      );
    } finally {
      setLoadingId(null);
    }
  }

  async function deleteProject(
    projectId: string,
  ) {
    const confirmed = window.confirm(
      "Delete this project? All traces and API keys belonging to it will also be deleted.",
    );

    if (!confirmed) {
      return;
    }

    setLoadingId(projectId);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Unable to get Clerk token");
      }

      const response = await fetch(
        `${API_URL}/v1/projects/${projectId}`,
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

      const remainingProjects = projects.filter(
        (project) => project.id !== projectId,
      );

      setProjects(remainingProjects);

      if (remainingProjects.length > 0) {
        openProject(remainingProjects[0]);
      } else {
        router.push("/projects");
        router.refresh();
      }
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to delete project",
      );
    } finally {
      setLoadingId(null);
    }
  }

  if (projects.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <h2 className="text-sm font-medium">
          No projects yet
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          Create a project to start collecting traces.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-medium">
          Your projects
        </h2>
      </div>

      {error && (
        <div className="border-b px-4 py-3 text-xs text-destructive">
          {error}
        </div>
      )}

      <div className="divide-y">
        {projects.map((project) => {
          const isEditing =
            editingId === project.id;

          const isLoading =
            loadingId === project.id;

          return (
            <div
              key={project.id}
              className="flex items-center gap-3 px-4 py-4"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted text-xs font-semibold">
                {project.name
                  .charAt(0)
                  .toUpperCase()}
              </div>

              {isEditing ? (
                <div className="min-w-0 flex-1">
                  <input
                    value={editingName}
                    onChange={(event) =>
                      setEditingName(
                        event.target.value,
                      )
                    }
                    autoFocus
                    disabled={isLoading}
                    className="h-8 w-full rounded-md border bg-background px-2.5 text-sm outline-none focus:border-foreground"
                  />
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    openProject(project)
                  }
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="truncate text-sm font-medium">
                    {project.name}
                  </div>

                  <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                    {project.id}
                  </div>
                </button>
              )}

              {isEditing ? (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      renameProject(project.id)
                    }
                    disabled={isLoading}
                    className="text-xs font-medium hover:underline disabled:opacity-50"
                  >
                    {isLoading
                      ? "Saving..."
                      : "Save"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={isLoading}
                    className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      startEditing(project)
                    }
                    disabled={isLoading}
                    className="text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    Rename
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      deleteProject(project.id)
                    }
                    disabled={isLoading}
                    className="text-xs text-destructive hover:underline disabled:opacity-50"
                  >
                    {isLoading
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
