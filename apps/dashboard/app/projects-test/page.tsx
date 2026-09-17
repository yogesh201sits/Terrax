"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";

import { getProjects, type Project } from "@/lib/api/projects";

export default function ProjectsTestPage() {
  const { getToken } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      try {
        const token = await getToken();

        if (!token) {
          throw new Error("No Clerk token");
        }

        const data = await getProjects(token);

        setProjects(data.projects);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load projects",
        );
      }
    }

    loadProjects();
  }, [getToken]);

  return (
    <main className="p-8">
      <h1 className="mb-6 text-2xl font-semibold">
        Projects
      </h1>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {projects.length === 0 && !error && (
        <p className="text-sm text-muted-foreground">
          No projects found.
        </p>
      )}

      <div className="space-y-3">
        {projects.map((project) => (
          <div
            key={project.id}
            className="rounded-lg border p-4"
          >
            <p className="font-medium">{project.name}</p>

            <p className="mt-1 text-xs text-muted-foreground">
              {project.id}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}