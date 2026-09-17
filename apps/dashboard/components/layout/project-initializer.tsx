"use client";

import { useProjects } from "@/hooks/use-projects";

export function ProjectInitializer() {
  useProjects();

  return null;
}