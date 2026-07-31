"use client";

import { useEffect, useState } from "react";

import { highlightCodeBlocksInHtml } from "./code-highlighting";
import { cn } from "@/lib/utils";

type RichTextContentRendererProps = {
  content: string;
  className?: string;
};

function extractTextFromSerializedContent(value: unknown): string {
  if (!value || typeof value !== "object") return "";

  const node = value as {
    text?: unknown;
    children?: unknown;
    root?: unknown;
  };

  if (typeof node.text === "string") {
    return node.text;
  }

  const children = Array.isArray(node.children)
    ? node.children
    : node.root && typeof node.root === "object"
    ? [(node.root as { children?: unknown }).children].flat()
    : [];

  return children
    .map(extractTextFromSerializedContent)
    .filter(Boolean)
    .join(" ");
}

export function RichTextContentRenderer({
  content,
  className = "prose prose-base dark:prose-invert",
}: RichTextContentRendererProps) {
  const [highlightedContent, setHighlightedContent] = useState({
    result: content,
    source: content,
  });

  useEffect(() => {
    setHighlightedContent({
      result: highlightCodeBlocksInHtml(content),
      source: content,
    });
  }, [content]);

  if (!content) {
    return null;
  }

  if (content.trim().startsWith("{")) {
    let textContent: string | null = null;
    let parseValidationError = false;

    try {
      textContent = extractTextFromSerializedContent(JSON.parse(content));
    } catch {
      parseValidationError = true;
    }

    return (
      <div className={cn("min-w-full w-full max-w-full", className)}>
        {parseValidationError ? content : textContent || content}
      </div>
    );
  }

  return (
    <div
      className={cn("min-w-full w-full max-w-full", className)}
      dangerouslySetInnerHTML={{
        __html:
          highlightedContent.source === content
            ? highlightedContent.result
            : content,
      }}
    />
  );
}
