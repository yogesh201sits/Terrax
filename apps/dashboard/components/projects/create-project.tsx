"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { FolderPlus } from "lucide-react";

import { toast } from "@/components/ui/toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const API_URL =
  process.env.NEXT_PUBLIC_TERRAX_API_URL ??
  "http://localhost:3000";

export function CreateProject() {
  const { getToken } = useAuth();
  const router = useRouter();

  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function createProject(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.add({
        title: "Project name is required",
        type: "error",
      });

      return;
    }

    setCreating(true);

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

      setName("");

      toast.add({
        title: "Project created",
        description:
          "Your Terrax project has been created successfully.",
        type: "success",
      });

      router.refresh();
    } catch (error) {
      console.error(error);

      toast.add({
        title: "Failed to create project",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating the project.",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-lg border bg-muted/50">
            <FolderPlus className="size-4 text-muted-foreground" />
          </div>

          <CardTitle className="text-sm">
            Create project
          </CardTitle>
        </div>

        <p className="text-xs text-muted-foreground">
          Create a project to organize your telemetry.
        </p>
      </CardHeader>

      <CardContent>
        <form
          onSubmit={createProject}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label
              htmlFor="project-name"
              className="text-xs font-medium"
            >
              Project name
            </label>

            <Input
              id="project-name"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="My AI Agent"
              disabled={creating}
            />
          </div>

          <Button
            type="submit"
            disabled={creating}
            className="w-full"
          >
            {creating ? "Creating..." : "Create project"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
