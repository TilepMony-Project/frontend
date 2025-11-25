'use client';

import clsx from 'clsx';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

import { Icon } from '@/components/icons';
import { RunButton } from '@/features/integration/components/run-button/run-button';
import { SaveButton } from '@/features/integration/components/save-button/save-button';
import { OptionalAppBarTools } from '@/features/plugins-core/components/optional-app-bar-toolbar';
import useStore from '@/store/store';

type CanvasTool = {
  id: 'select' | 'pan';
  label: string;
  icon: string;
};

function CanvasToolToggle() {
  const mode = useStore((state) => state.canvasInteractionMode);
  const setMode = useStore((state) => state.setCanvasInteractionMode);

  const tools: CanvasTool[] = useMemo(
    () => [
      { id: 'select', label: 'Select Tool', icon: 'Pointer' },
      { id: 'pan', label: 'Hand Tool', icon: 'Hand' },
    ],
    []
  );

  return (
    <div className="flex rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#1c1c20]">
      {tools.map((tool, index) => (
        <button
          key={tool.id}
          type="button"
          onClick={() => setMode(tool.id)}
          aria-pressed={mode === tool.id}
          aria-label={tool.label}
          className={clsx(
            'flex items-center gap-1 px-3 py-1.5 text-sm transition-colors',
            index === 0 && 'rounded-l-full',
            index === tools.length - 1 && 'rounded-r-full',
            mode === tool.id
              ? 'bg-[#1296e7] text-white shadow-sm'
              : 'text-gray-600 hover:bg-[#eeeff3] dark:text-gray-300 dark:hover:bg-[#2c2d31]'
          )}
        >
          <Icon name={tool.icon} size={16} />
        </button>
      ))}
    </div>
  );
}

export function Toolbar() {
  const router = useRouter();

  function handleNavigateToDashboard() {
    router.push('/dashboard');
  }

  return (
    <div className="flex items-center justify-between gap-8">
      <div className="flex items-center gap-4">
        <Button
          className="flex items-center gap-[0.35rem] rounded-full px-[0.85rem] py-[0.35rem] font-semibold"
          variant="secondary"
          size="sm"
          onClick={handleNavigateToDashboard}
        >
          <Icon name="ArrowLeft" size={16} />
          Back
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <OptionalAppBarTools>
          <SaveButton />
          <RunButton />
        </OptionalAppBarTools>
        <CanvasToolToggle />
      </div>
    </div>
  );
}
