"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Copy, KeyRound, Plus, Trash2 } from "lucide-react";

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
  projectName: string;
};

export function ApiKeysList({
  projectId,
  projectName,
}: ApiKeysListProps) {
  const { getToken } = useAuth();

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [name, setName] = useState("");
  const [newApiKey, setNewApiKey] = useState<string | null>(null);

  const [revokeDialogOpen, setRevokeDialogOpen] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState<string | null>(
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
      setLoading(true);

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

      setNewApiKey(data.apiKey);
      setName("");

      toast.add({
        title: "API key created",
        description: `API key created for ${projectName}. Copy it now. It will not be shown again.`,
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

  function openRevokeDialog(keyId: string) {
    setSelectedKeyId(keyId);
    setRevokeDialogOpen(true);
  }

  async function revokeKey() {
    if (!selectedKeyId) {
      return;
    }

    setRevoking(true);

    try {
      const token = await getAuthToken();

      const response = await fetch(
        `${API_URL}/v1/projects/${projectId}/api-keys/${selectedKeyId}`,
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
          key.id === selectedKeyId
            ? {
                ...key,
                revokedAt: new Date().toISOString(),
              }
            : key,
        ),
      );

      setRevokeDialogOpen(false);
      setSelectedKeyId(null);

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
    } finally {
      setRevoking(false);
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
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <KeyRound className="size-5 text-muted-foreground" />

          <h1 className="text-xl font-semibold tracking-tight">
            API Keys
          </h1>

          <Badge variant="secondary">
            {projectName}
          </Badge>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage API keys used to send telemetry to this project.
        </p>
      </div>

      {/* Create API key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Create API key
          </CardTitle>

          <p className="text-xs text-muted-foreground">
            Generate a key for an application or environment.
          </p>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={createKey}
            className="flex flex-col gap-3 sm:flex-row"
          >
            <Input
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="e.g. Production"
              disabled={creating}
              className="sm:max-w-md"
            />

            <Button
              type="submit"
              disabled={creating}
            >
              <Plus className="size-4" />

              {creating
                ? "Creating..."
                : "Create API key"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Newly created key */}
      {newApiKey && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-sm">
              API key created
            </CardTitle>

            <p className="text-xs text-muted-foreground">
              Copy this key now. It will not be shown again.
            </p>
          </CardHeader>

          <CardContent>
            <div className="flex gap-2">
              <code className="min-w-0 flex-1 overflow-x-auto rounded-md border bg-background px-3 py-2 font-mono text-xs">
                {newApiKey}
              </code>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={copyKey}
              >
                <Copy className="size-4" />
                Copy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Existing API keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">
              API keys
            </CardTitle>

            <Badge variant="outline">
              {keys.length} {keys.length === 1 ? "key" : "keys"}
            </Badge>
          </div>
        </CardHeader>

        <Separator />

        {loading ? (
          <div className="space-y-4 p-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : keys.length === 0 ? (
          <div className="p-10 text-center">
            <KeyRound className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">
              No API keys yet
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Create an API key to start sending telemetry.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">
                      {key.name}
                    </TableCell>

                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 font-mono text-xs">
                        {key.keyPrefix}••••••••
                      </code>
                    </TableCell>

                    <TableCell>
                      {key.revokedAt ? (
                        <Badge variant="destructive">
                          Revoked
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Active
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(
                        key.createdAt,
                      ).toLocaleDateString()}
                    </TableCell>

                    <TableCell className="text-right">
                      {!key.revokedAt && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() =>
                            openRevokeDialog(key.id)
                          }
                        >
                          <Trash2 className="size-4" />
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Revoke confirmation */}
      <AlertDialog
        open={revokeDialogOpen}
        onOpenChange={setRevokeDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Revoke API key?
            </AlertDialogTitle>

            <AlertDialogDescription>
              This action cannot be undone. Applications using
              this API key will no longer be able to send
              telemetry to Terrax.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={revoking}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={revokeKey}
              disabled={revoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revoking ? "Revoking..." : "Revoke API key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
