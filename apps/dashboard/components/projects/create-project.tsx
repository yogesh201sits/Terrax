"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Activity,
  FolderPlus,
  Layers3,
  Sparkles,
  Workflow,
} from "lucide-react";

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

      const response = await fetch(`${API_URL}/v1/projects`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
        }),
      });

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
    <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      {/* ---------------------------------------------------------------- */}
      {/* Create project                                                   */}
      {/* ---------------------------------------------------------------- */}

      <Card
        className="
          h-fit
          overflow-hidden
          rounded-2xl
          border
          border-border/60
          bg-background
          shadow-[8px_8px_24px_rgba(0,0,0,0.07),-8px_-8px_24px_rgba(255,255,255,0.8)]
        "
      >
        <CardHeader className="border-b border-border/40 bg-muted/10 pb-5">
          <div className="flex items-center gap-3">
            {/* Neo icon */}
            <div
              className="
                flex size-10 items-center justify-center
                rounded-xl
                border border-border/60
                bg-background
                shadow-[inset_2px_2px_5px_rgba(0,0,0,0.07),2px_2px_6px_rgba(0,0,0,0.05)]
              "
            >
              <FolderPlus className="size-4 text-muted-foreground" />
            </div>

            <div>
              <CardTitle className="text-sm font-semibold">
                Create project
              </CardTitle>

              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Organize your telemetry into a project.
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <form
            onSubmit={createProject}
            className="space-y-5"
          >
            {/* Project name */}
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
                className="
                  h-10
                  rounded-xl
                  border-border/60
                  bg-muted/10
                  shadow-[inset_2px_2px_6px_rgba(0,0,0,0.06)]
                  focus-visible:shadow-[inset_2px_2px_6px_rgba(0,0,0,0.08)]
                "
              />
            </div>

            {/* Create button */}
            <Button
              type="submit"
              disabled={creating}
              className="
                h-10
                w-full
                rounded-xl
                shadow-[3px_3px_8px_rgba(0,0,0,0.12),-2px_-2px_6px_rgba(255,255,255,0.08)]
                transition-all
                active:translate-y-px
                active:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.15)]
              "
            >
              {creating ? "Creating..." : "Create project"}
            </Button>
          </form>

          {/* Small helper */}
          <div className="mt-5 border-t border-border/40 pt-4">
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />

              <span>
                OpenTelemetry-ready project
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ---------------------------------------------------------------- */}
      {/* Neo-morphic telemetry visualization                             */}
      {/* ---------------------------------------------------------------- */}

      <div
        className="
          relative
          hidden
          min-h-[350px]
          overflow-hidden
          rounded-2xl
          border
          border-border/50
          bg-muted/10
          shadow-[inset_3px_3px_10px_rgba(0,0,0,0.04),inset_-3px_-3px_10px_rgba(255,255,255,0.8)]
          lg:block
        "
      >
        {/* Technical grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Decorative nodes */}
        <div
          className="
            absolute left-10 top-12 size-3 rounded-full
            border border-border
            bg-background
            shadow-[2px_2px_5px_rgba(0,0,0,0.08),-2px_-2px_5px_rgba(255,255,255,0.8)]
          "
        />

        <div className="absolute right-14 top-16 flex size-3 items-center justify-center">
          <span className="size-2 rounded-full bg-emerald-500/70 shadow-[0_0_8px_rgba(34,197,94,0.35)]" />
        </div>

        <div
          className="
            absolute bottom-16 left-16 size-3 rounded-full
            border border-border
            bg-background
            shadow-[2px_2px_5px_rgba(0,0,0,0.08)]
          "
        />

        <div
          className="
            absolute bottom-12 right-20 size-3 rounded-full
            border border-border
            bg-background
            shadow-[2px_2px_5px_rgba(0,0,0,0.08)]
          "
        />

        {/* Connection lines */}
        <div className="absolute left-[13%] top-[30%] h-px w-[25%] bg-border/70" />
        <div className="absolute right-[13%] top-[30%] h-px w-[25%] bg-border/70" />

        <div className="absolute left-1/2 top-[30%] h-[16%] w-px -translate-x-1/2 bg-border/70" />

        <div className="absolute bottom-[30%] left-[13%] h-px w-[25%] bg-border/70" />
        <div className="absolute bottom-[30%] right-[13%] h-px w-[25%] bg-border/70" />

        <div className="absolute bottom-[30%] left-1/2 h-[16%] w-px -translate-x-1/2 bg-border/70" />

        {/* Main raised panel */}
        <div
          className="
            absolute
            left-1/2
            top-1/2
            w-[320px]
            -translate-x-1/2
            -translate-y-1/2
            rounded-2xl
            border
            border-border/60
            bg-background/95
            p-5
            shadow-[10px_10px_24px_rgba(0,0,0,0.09),-10px_-10px_24px_rgba(255,255,255,0.9)]
          "
        >
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Terrax
              </p>

              <p className="mt-1 text-sm font-semibold">
                Telemetry pipeline
              </p>
            </div>

            <div
              className="
                flex items-center gap-1.5
                rounded-full
                border border-border/60
                bg-background
                px-2.5 py-1.5
                shadow-[inset_1px_1px_3px_rgba(0,0,0,0.05)]
              "
            >
              <span className="size-1.5 rounded-full bg-emerald-500" />

              <span className="text-[10px] font-medium text-muted-foreground">
                Ready
              </span>
            </div>
          </div>

          {/* Telemetry nodes */}
          <div className="grid grid-cols-2 gap-3">
            <TelemetryNode
              icon={Activity}
              label="Traces"
            />

            <TelemetryNode
              icon={Layers3}
              label="Spans"
            />

            <TelemetryNode
              icon={Sparkles}
              label="Agents"
            />

            <TelemetryNode
              icon={Workflow}
              label="Workflow"
            />
          </div>

          {/* Pipeline indicator */}
          <div className="mt-5 flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />

            <div
              className="
                flex size-6 items-center justify-center
                rounded-lg
                border border-border/60
                bg-background
                shadow-[2px_2px_5px_rgba(0,0,0,0.06),-2px_-2px_5px_rgba(255,255,255,0.8)]
              "
            >
              <span className="size-1.5 rounded-full bg-emerald-500/80" />
            </div>

            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Bottom status */}
          <div
            className="
              mt-4
              flex
              items-center
              justify-between
              rounded-xl
              border
              border-border/50
              bg-muted/20
              px-3
              py-2.5
              shadow-[inset_2px_2px_6px_rgba(0,0,0,0.05)]
            "
          >
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Observability
              </p>

              <p className="mt-0.5 text-xs font-medium">
                OpenTelemetry ready
              </p>
            </div>

            <div
              className="
                flex size-7 items-center justify-center
                rounded-lg
                border border-border/60
                bg-background
                shadow-[2px_2px_5px_rgba(0,0,0,0.06),-2px_-2px_5px_rgba(255,255,255,0.8)]
              "
            >
              <Activity className="size-3.5 text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TelemetryNode({
  icon: Icon,
  label,
}: {
  icon: typeof Activity;
  label: string;
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2.5
        rounded-xl
        border
        border-border/60
        bg-background
        px-3
        py-2.5
        shadow-[3px_3px_7px_rgba(0,0,0,0.06),-3px_-3px_7px_rgba(255,255,255,0.7)]
      "
    >
      <div
        className="
          flex size-7 shrink-0 items-center justify-center
          rounded-lg
          border border-border/50
          bg-muted/20
          shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05)]
        "
      >
        <Icon className="size-3.5 text-muted-foreground" />
      </div>

      <span className="text-xs font-medium">
        {label}
      </span>
    </div>
  );
}
