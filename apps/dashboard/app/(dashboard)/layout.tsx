import { AppSidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ProjectInitializer } from "@/components/layout/project-initializer";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <ProjectInitializer />

      <AppSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}