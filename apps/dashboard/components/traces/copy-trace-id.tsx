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
      className="rounded-md border px-2.5 py-1 text-xs font-medium hover:bg-muted"
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}