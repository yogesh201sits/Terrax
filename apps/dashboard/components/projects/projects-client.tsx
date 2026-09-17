"use client";

import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/toast";

type Props = {
  children: ReactNode;
};

export function ProjectsClient({ children }: Props) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}