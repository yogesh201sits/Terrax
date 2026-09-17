"use client";

import { useAuth } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { getProjects } from "@/lib/api/projects";
import { useProjectStore } from "@/store/project-store";

export function useProjects() {
  const { getToken } = useAuth();
  const searchParams = useSearchParams();

  const projects = useProjectStore(
    (state) => state.projects,
  );

  const activeProject = useProjectStore(
    (state) => state.activeProject,
  );

  const setProjects = useProjectStore(
    (state) => state.setProjects,
  );

  const setActiveProject = useProjectStore(
    (state) => state.setActiveProject,
  );

  const projectId = searchParams.get("projectId");

  useEffect(() => {
    async function loadProjects() {
      const token = await getToken();

      if (!token) {
        return;
      }

      const data = await getProjects(token);

      setProjects(data.projects);

      if (projectId) {
        const project = data.projects.find(
          (item) => item.id === projectId,
        );

        if (project) {
          setActiveProject(project);
        }
      }
    }

    loadProjects().catch(console.error);
  }, [
    getToken,
    projectId,
    setProjects,
    setActiveProject,
  ]);

  return {
    projects,
    activeProject,
  };
}
