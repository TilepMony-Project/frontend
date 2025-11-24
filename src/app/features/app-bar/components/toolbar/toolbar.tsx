'use client';

import { Button } from '@synergycodes/overflow-ui';
import { useRouter } from 'next/navigation';

import { Icon } from '@/components/icons';
import { RunButton } from '@/features/integration/components/run-button/run-button';
import { SaveButton } from '@/features/integration/components/save-button/save-button';
import { OptionalAppBarTools } from '@/features/plugins-core/components/optional-app-bar-toolbar';

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
          size="small"
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
      </div>
    </div>
  );
}
