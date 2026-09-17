"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useProjectStore } from "@/store/project-store";

const API_URL =
  process.env.NEXT_PUBLIC_TERRAX_API_URL ??
  "http://localhost:3000";

export function CreateProject() {
  const { getToken } = useAuth();
  const router = useRouter();

  const setActiveProject = useProjectStore(
    (state) => state.setActiveProject,
  );

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Project name is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Unable to get Clerk token");
      }

      const response = await fetch(
        `${API_URL}/v1/projects`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: trimmedName,
          }),
        },
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `Failed to create project: ${response.status} ${body}`,
        );
      }

      const data = await response.json();

      setActiveProject(data.project);

      router.push(
        `/overview?projectId=${encodeURIComponent(
          data.project.id,
        )}`,
      );

      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create project",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border bg-card"
    >
      <div className="border-b px-5 py-4">
        <h2 className="text-sm font-semibold">
          Create project
        </h2>

        <p className="mt-1 text-xs text-muted-foreground">
          Create a project to isolate your traces and API keys.
        </p>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <label
            htmlFor="project-name"
            className="text-xs font-medium"
          >
            Project name
          </label>

          <input
            id="project-name"
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="My AI Agent"
            disabled={loading}
            className="mt-2 h-9 w-full rounded-md border bg-background px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
          />
        </div>

        {error && (
          <p className="text-xs text-destructive">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-9 items-center rounded-md bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create project"}
        </button>
      </div>
    </form>
  );
}
