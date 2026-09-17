"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";

const API_URL =
  process.env.NEXT_PUBLIC_TERRAX_API_URL ??
  "http://localhost:3000";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
};

type ApiKeysListProps = {
  projectId: string;
};

export function ApiKeysList({
  projectId,
}: ApiKeysListProps) {
  const { getToken } = useAuth();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(
    null,
  );

  async function getAuthToken() {
    const token = await getToken();

    if (!token) {
      throw new Error("Unable to get Clerk token");
    }

    return token;
  }

  async function loadKeys() {
    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/v1/projects/${projectId}/api-keys`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        },
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch API keys: ${response.status}`,
        );
      }

      const data = await response.json();

      setKeys(data.keys);
    } catch (error) {
      console.error(error);

      toast.add({
        title: "Failed to load API keys",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while loading API keys.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadKeys();
  }, [projectId]);

  async function createKey(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      toast.add({
        title: "API key name is required",
        type: "error",
      });

      return;
    }

    setCreating(true);
    setNewApiKey(null);

    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/v1/projects/${projectId}/api-keys`,
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
          `Failed to create API key: ${response.status} ${body}`,
        );
      }

      const data = await response.json();

      /*
       * The raw key is returned only at creation time.
       * Store it locally so the user can copy it.
       */
      setNewApiKey(data.apiKey);
      setName("");

      toast.add({
        title: "API key created",
        description:
          "Copy your API key now. It will not be shown again.",
        type: "success",
      });

      await loadKeys();
    } catch (error) {
      console.error(error);

      toast.add({
        title: "Failed to create API key",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while creating the API key.",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(keyId: string) {
    const confirmed = window.confirm(
      "Revoke this API key? Applications using it will no longer be able to send telemetry.",
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/v1/projects/${projectId}/api-keys/${keyId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const body = await response.text();

        throw new Error(
          `Failed to revoke API key: ${response.status} ${body}`,
        );
      }

      setKeys((current) =>
        current.map((key) =>
          key.id === keyId
            ? {
                ...key,
                revokedAt: new Date().toISOString(),
              }
            : key,
        ),
      );

      toast.add({
        title: "API key revoked",
        description:
          "This API key can no longer send telemetry.",
        type: "success",
      });
    } catch (error) {
      console.error(error);

      toast.add({
        title: "Failed to revoke API key",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong while revoking the API key.",
        type: "error",
      });
    }
  }

  async function copyKey() {
    if (!newApiKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(newApiKey);

      toast.add({
        title: "API key copied",
        type: "success",
      });
    } catch (error) {
      console.error(error);

      toast.add({
        title: "Failed to copy API key",
        description: "Please copy the key manually.",
        type: "error",
      });
    }
  }

  return (
    <div className="space-y-6">
      {/* Create key */}
      <form
        onSubmit={createKey}
        className="rounded-lg border bg-card"
      >
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold">
            Create API key
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Use this key to send OpenTelemetry telemetry to Terrax.
          </p>
        </div>

        <div className="flex flex-col gap-3 p-5 sm:flex-row">
          <input
            value={name}
            onChange={(event) =>
              setName(event.target.value)
            }
            placeholder="Development"
            disabled={creating}
            className="h-9 flex-1 rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground"
          />

          <button
            type="submit"
            disabled={creating}
            className="h-9 rounded-md bg-foreground px-4 text-xs font-medium text-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            {creating
              ? "Creating..."
              : "Create API key"}
          </button>
        </div>
      </form>

      {/* Newly created key */}
      {newApiKey && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-5">
          <p className="text-sm font-medium">
            API key created
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            Copy this key now. It will not be shown again.
          </p>

          <div className="mt-4 flex gap-2">
            <code className="min-w-0 flex-1 overflow-x-auto rounded-md border bg-background px-3 py-2 font-mono text-xs">
              {newApiKey}
            </code>

            <button
              type="button"
              onClick={copyKey}
              className="rounded-md border px-3 text-xs font-medium hover:bg-muted"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {/* Existing keys */}
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold">
            API keys
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Loading API keys...
          </div>
        ) : keys.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No API keys yet.
          </div>
        ) : (
          <div className="divide-y">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">
                    {key.name}
                  </div>

                  <div className="mt-1 font-mono text-xs text-muted-foreground">
                    {key.keyPrefix}••••••••
                  </div>

                  <div className="mt-1 text-[10px] text-muted-foreground">
                    Created{" "}
                    {new Date(
                      key.createdAt,
                    ).toLocaleString()}
                  </div>
                </div>

                {key.revokedAt ? (
                  <span className="text-xs text-destructive">
                    Revoked
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      revokeKey(key.id)
                    }
                    className="text-xs text-destructive hover:underline"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
