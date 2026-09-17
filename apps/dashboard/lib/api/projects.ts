const API_URL =
  process.env.NEXT_PUBLIC_TERRAX_API_URL ??
  "http://localhost:3000";

export type Project = {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export async function getProjects(token: string) {
  const response = await fetch(`${API_URL}/v1/projects`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();

    throw new Error(
      `Failed to fetch projects: ${response.status} ${body}`,
    );
  }

  return response.json() as Promise<{
    projects: Project[];
  }>;
}