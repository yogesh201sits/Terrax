"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Check,
  ChevronDown,
  Copy,
  FlaskConical,
  MessageSquare,
  Play,
  RotateCcw,
  Wrench,
} from "lucide-react";

import type { TraceSpan } from "@/types/trace-detail";

type Props = {
  projectId: string;
  traceId: string;
  span: TraceSpan;
};

type MessageRole =
  | "system"
  | "user"
  | "assistant"
  | "tool";

type PlaygroundMessage = {
  id: string;
  role: MessageRole;
  content: string;
};

export function Playground({
  projectId,
  traceId,
  span,
}: Props) {
  const originalMessages = useMemo(
    () => extractMessages(span.prompt),
    [span.prompt],
  );

  const [messages, setMessages] = useState<PlaygroundMessage[]>(
    originalMessages,
  );

  const [copied, setCopied] = useState(false);

  const hasChanges =
    JSON.stringify(messages) !== JSON.stringify(originalMessages);

  function updateMessage(id: string, content: string) {
    setMessages((current) =>
      current.map((message) =>
        message.id === id
          ? {
              ...message,
              content,
            }
          : message,
      ),
    );
  }

  function resetMessages() {
    setMessages(originalMessages);
  }

  async function copyPrompt() {
    const prompt = JSON.stringify(
      messages.map(({ role, content }) => ({
        role,
        content,
      })),
      null,
      2,
    );

    await navigator.clipboard.writeText(prompt);

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="flex h-14 items-center justify-between px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/traces/${encodeURIComponent(
                traceId,
              )}?projectId=${encodeURIComponent(projectId)}`}
              className="
                flex size-8 shrink-0 items-center justify-center
                rounded-md border
                text-muted-foreground
                transition-colors
                hover:bg-muted
                hover:text-foreground
              "
            >
              <ArrowLeft className="size-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FlaskConical className="size-4 text-muted-foreground" />

                <h1 className="truncate text-sm font-semibold">
                  Prompt Playground
                </h1>
              </div>

              <p className="truncate text-[11px] text-muted-foreground">
                Experiment with this LLM span
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {hasChanges && (
              <button
                type="button"
                onClick={resetMessages}
                className="
                  inline-flex h-8 items-center gap-1.5
                  rounded-md border
                  px-3
                  text-xs font-medium
                  text-muted-foreground
                  transition-colors
                  hover:bg-muted
                  hover:text-foreground
                "
              >
                <RotateCcw className="size-3.5" />
                Reset
              </button>
            )}

            <button
              type="button"
              disabled
              title="Execution will be added later"
              className="
                inline-flex h-8 items-center gap-1.5
                rounded-md
                bg-foreground
                px-3
                text-xs font-medium
                text-background
                opacity-50
              "
            >
              <Play className="size-3.5" />
              Run
            </button>
          </div>
        </div>
      </div>

      {/* Source information */}
      <div className="border-b bg-muted/20">
        <div className="mx-auto flex max-w-[1500px] items-center gap-6 overflow-x-auto px-6 py-3">
          <SourceItem
            label="Provider"
            value={span.provider ?? "Unknown"}
          />

          <SourceItem
            label="Model"
            value={span.model ?? "Unknown"}
          />

          <SourceItem
            label="Span"
            value={span.name}
          />

          <SourceItem
            label="Tokens"
            value={
              span.totalTokens !== undefined
                ? span.totalTokens.toLocaleString()
                : "—"
            }
          />

          <SourceItem
            label="Duration"
            value={`${Math.round(span.durationMs)} ms`}
          />

          <div className="ml-auto shrink-0">
            <span
              className="
                inline-flex items-center gap-1.5
                rounded-full border
                px-2.5 py-1
                text-[10px] font-medium
                text-muted-foreground
              "
            >
              <span className="size-1.5 rounded-full bg-current" />
              Production span
            </span>
          </div>
        </div>
      </div>

      {/* Main workspace */}
      <div className="mx-auto grid max-w-[1500px] gap-4 p-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
        {/* Editor */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-background">
          <div className="flex h-12 items-center justify-between border-b px-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-muted-foreground" />

              <div>
                <h2 className="text-sm font-semibold">
                  Prompt
                </h2>

                <p className="text-[10px] text-muted-foreground">
                  Edit the captured messages
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={copyPrompt}
              className="
                inline-flex items-center gap-1.5
                rounded-md px-2 py-1.5
                text-xs text-muted-foreground
                transition-colors
                hover:bg-muted
                hover:text-foreground
              "
            >
              {copied ? (
                <Check className="size-3.5" />
              ) : (
                <Copy className="size-3.5" />
              )}

              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          {/* Model */}
          <div className="border-b p-4">
            <label className="mb-2 block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Model
            </label>

            <div className="flex h-9 items-center justify-between rounded-md border bg-muted/20 px-3">
              <div className="flex min-w-0 items-center gap-2">
                <Bot className="size-3.5 shrink-0 text-muted-foreground" />

                <span className="truncate text-xs font-medium">
                  {span.model ?? "Unknown model"}
                </span>
              </div>

              <ChevronDown className="size-3.5 text-muted-foreground" />
            </div>
          </div>

          {/* Messages */}
          <div className="space-y-3 p-4">
            {messages.length > 0 ? (
              messages.map((message, index) => (
                <MessageEditor
                  key={message.id}
                  message={message}
                  index={index}
                  onChange={(content) =>
                    updateMessage(message.id, content)
                  }
                />
              ))
            ) : (
              <EmptyPrompt />
            )}
          </div>

          {/* Tool context */}
          {span.toolCalls &&
            span.toolCalls.length > 0 && (
              <div className="border-t p-4">
                <div className="mb-2 flex items-center gap-2">
                  <Wrench className="size-3.5 text-muted-foreground" />

                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Tool Context
                  </span>
                </div>

                <pre className="max-h-48 overflow-auto rounded-md bg-muted p-3 text-[11px] leading-relaxed">
                  {JSON.stringify(
                    span.toolCalls,
                    null,
                    2,
                  )}
                </pre>
              </div>
            )}
        </section>

        {/* Original trace result */}
        <section className="min-w-0 overflow-hidden rounded-lg border bg-background">
          <div className="flex h-12 items-center justify-between border-b px-4">
            <div>
              <h2 className="text-sm font-semibold">
                Original Run
              </h2>

              <p className="text-[10px] text-muted-foreground">
                Captured from the production trace
              </p>
            </div>

            <span
              className="
                rounded-full border
                px-2 py-0.5
                text-[10px] font-medium
                text-muted-foreground
              "
            >
              Read only
            </span>
          </div>

          <div className="space-y-5 p-4">
            <ResultSection
              title="Input"
              content={formatValue(span.prompt)}
            />

            <ResultSection
              title="Output"
              content={
                formatValue(span.completion) ||
                "No completion captured."
              }
            />

            {span.errorMessage && (
              <ResultSection
                title="Error"
                content={span.errorMessage}
                error
              />
            )}

            <div className="border-t pt-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Run metadata
              </p>

              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border bg-border">
                <MetadataItem
                  label="Input tokens"
                  value={
                    span.inputTokens?.toLocaleString() ?? "—"
                  }
                />

                <MetadataItem
                  label="Output tokens"
                  value={
                    span.outputTokens?.toLocaleString() ?? "—"
                  }
                />

                <MetadataItem
                  label="Total tokens"
                  value={
                    span.totalTokens?.toLocaleString() ?? "—"
                  }
                />

                <MetadataItem
                  label="Reasoning tokens"
                  value={
                    span.reasoningTokens?.toLocaleString() ?? "—"
                  }
                />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Experimental notice */}
      <div className="mx-auto max-w-[1500px] px-6 pb-6">
        <div className="flex items-start gap-3 rounded-md border bg-muted/20 px-4 py-3">
          <FlaskConical className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

          <div>
            <p className="text-xs font-medium">
              Playground mode
            </p>

            <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
              This workspace is based on the selected production
              span. Changes are local to this session and do not
              modify the original trace.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageEditor({
  message,
  index,
  onChange,
}: {
  message: PlaygroundMessage;
  index: number;
  onChange: (content: string) => void;
}) {
  return (
    <div className="overflow-hidden rounded-md border">
      <div className="flex h-9 items-center justify-between border-b bg-muted/20 px-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            {message.role}
          </span>

          <span className="text-[10px] text-muted-foreground">
            #{index + 1}
          </span>
        </div>
      </div>

      <textarea
        value={message.content}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="
          min-h-28
          w-full
          resize-y
          bg-background
          p-3
          font-mono
          text-xs
          leading-relaxed
          outline-none
          placeholder:text-muted-foreground
          focus:bg-muted/10
        "
        placeholder="Message content..."
      />
    </div>
  );
}

function ResultSection({
  title,
  content,
  error = false,
}: {
  title: string;
  content: string;
  error?: boolean;
}) {
  return (
    <div>
      <p
        className={`mb-2 text-[10px] font-semibold uppercase tracking-wide ${
          error
            ? "text-destructive"
            : "text-muted-foreground"
        }`}
      >
        {title}
      </p>

      <pre
        className={`max-h-[380px] overflow-auto whitespace-pre-wrap rounded-md border p-3 text-xs leading-relaxed ${
          error
            ? "border-destructive/30 bg-destructive/5"
            : "bg-muted/20"
        }`}
      >
        {content}
      </pre>
    </div>
  );
}

function MetadataItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-background p-3">
      <p className="text-[9px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-xs font-semibold">
        {value}
      </p>
    </div>
  );
}

function SourceItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 shrink-0">
      <p className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-0.5 max-w-56 truncate text-xs font-medium">
        {value}
      </p>
    </div>
  );
}

function EmptyPrompt() {
  return (
    <div className="rounded-md border border-dashed p-8 text-center">
      <MessageSquare className="mx-auto size-5 text-muted-foreground" />

      <p className="mt-2 text-xs font-medium">
        No structured messages found
      </p>

      <p className="mt-1 text-[11px] text-muted-foreground">
        The captured prompt format cannot be edited as
        individual messages.
      </p>
    </div>
  );
}

function extractMessages(
  value: unknown,
): PlaygroundMessage[] {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return [];
  }

  const messages = (
    value as {
      messages?: unknown;
    }
  ).messages;

  if (!Array.isArray(messages)) {
    return [];
  }

  return messages
    .map((message, index): PlaygroundMessage | null => {
      if (
        !message ||
        typeof message !== "object"
      ) {
        return null;
      }

      const item = message as {
        role?: unknown;
        content?: unknown;
      };

      const role = normalizeRole(item.role);

      if (!role) {
        return null;
      }

      return {
        id: `${role}-${index}`,
        role,
        content: formatValue(item.content),
      };
    })
    .filter(
      (
        message,
      ): message is PlaygroundMessage =>
        message !== null,
    );
}

function normalizeRole(
  value: unknown,
): MessageRole | null {
  if (
    value === "system" ||
    value === "user" ||
    value === "assistant" ||
    value === "tool"
  ) {
    return value;
  }

  return null;
}

function formatValue(value: unknown): string {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(
      value,
      null,
      2,
    );
  } catch {
    return String(value);
  }
}
