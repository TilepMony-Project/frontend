import { Textarea } from "@/components/ui/textarea";
import React, { Suspense } from "react";

import type { SyntaxHighlighterProps } from "./syntax-highlighter";

const SyntaxHighlighter = React.lazy(() =>
  import("./syntax-highlighter").then((module) => ({ default: module.SyntaxHighlighter }))
);

type SyntaxHighlighterLazyProps = SyntaxHighlighterProps;

export function SyntaxHighlighterLazy(props: SyntaxHighlighterLazyProps) {
  const { value, onChange, isDisabled, placeholder } = props;

  return (
    <Suspense
      fallback={
        <Textarea
          value={value}
          onChange={(event) => (onChange ? onChange(event.target.value) : undefined)}
          disabled={isDisabled}
          placeholder={placeholder}
          className="rounded-xl border-border bg-background dark:bg-[#1e1e1e] font-mono text-sm min-h-[300px]"
        />
      }
    >
      <SyntaxHighlighter
        value={value}
        onChange={(value) => (onChange ? onChange(value || "") : undefined)}
        isDisabled={isDisabled}
        placeholder={placeholder}
      />
    </Suspense>
  );
}
