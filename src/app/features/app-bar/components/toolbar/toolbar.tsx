'use client';

import styles from '../../app-bar.module.css';

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
    <div className={styles.toolbar}>
      <div className={styles['brand-section']}>
        <Button
          className={styles['back-button']}
          variant="secondary"
          size="small"
          onClick={handleNavigateToDashboard}
        >
          <Icon name="ArrowLeft" size={16} />
          <span>Back</span>
        </Button>
      </div>
      <div className={styles['nav-segment']}>
        <OptionalAppBarTools>
          <SaveButton />
          <RunButton />
        </OptionalAppBarTools>
      </div>
    </div>
  );
}
