"use client";

import { useState } from "react";

type Props = {
  traceId: string;
};

export function CopyTraceId({ traceId }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(traceId);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={copied ? "Copied!" : "Click to copy trace ID"}
      className="min-w-0 max-w-full break-all text-left font-mono text-xs text-muted-foreground hover:text-foreground hover:underline"
    >
      {traceId}
    </button>
  );
}