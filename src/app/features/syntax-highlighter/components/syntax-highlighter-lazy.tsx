import React, { Suspense } from 'react';
import { Textarea } from '@/components/ui/textarea';

import type { SyntaxHighlighterProps } from './syntax-highlighter';

const SyntaxHighlighter = React.lazy(() =>
  import('./syntax-highlighter').then((module) => ({ default: module.SyntaxHighlighter }))
);

type SyntaxHighlighterLazyProps = SyntaxHighlighterProps;

export function SyntaxHighlighterLazy(props: SyntaxHighlighterLazyProps) {
  const { value, onChange, isDisabled } = props;

  return (
    <Suspense
      fallback={
        <Textarea
          value={value}
          onChange={(event) => (onChange ? onChange(event.target.value) : undefined)}
          disabled={isDisabled}
        />
      }
    >
      <SyntaxHighlighter
        value={value}
        onChange={(value) => (onChange ? onChange(value || '') : undefined)}
        isDisabled={isDisabled}
      />
    </Suspense>
  );
}
