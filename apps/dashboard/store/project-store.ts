import { create } from "zustand";

import type { Project } from "@/lib/api/projects";

type ProjectStore = {
  projects: Project[];
  activeProject: Project | null;

  setProjects: (projects: Project[]) => void;
  setActiveProject: (project: Project) => void;
};

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  activeProject: null,

  setProjects: (projects) =>
    set((state) => {
      const currentProject = state.activeProject;

      const activeProject =
        currentProject &&
        projects.some(
          (project) => project.id === currentProject.id,
        )
          ? currentProject
          : projects[0] ?? null;

      return {
        projects,
        activeProject,
      };
    }),

  setActiveProject: (project) =>
    set({
      activeProject: project,
    }),
}));
