import { auth } from "@clerk/nextjs/server";

import { getProjects } from "@/lib/api/projects";
import { ApiKeysList } from "@/components/api-keys/api-keys-list";

type Props = {
    searchParams: Promise<{
        projectId?: string;
    }>;
};

export default async function ApiKeysPage({
    searchParams,
}: Props) {
    const { projectId } = await searchParams;

    const { userId, getToken } = await auth();

    if (!userId) {
        return null;
    }

    const token = await getToken();

    if (!token) {
        throw new Error("Unable to get Clerk token");
    }

    const { projects } = await getProjects(token);

    const activeProject =
        projects.find(
            (project) => project.id === projectId,
        ) ?? projects[0];

    if (!activeProject) {
        return (
            <div className="p-6">
                <div className="rounded-lg border p-12 text-center">
                    <p className="text-sm text-muted-foreground">
                        Create a project before creating an API key.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-full bg-background">
            <div className="mx-auto w-full max-w-[1200px] px-6 py-8">
                <ApiKeysList
                projectId={activeProject.id}
                projectName={activeProject.name}
                />
            </div>
        </div>
    );
}
