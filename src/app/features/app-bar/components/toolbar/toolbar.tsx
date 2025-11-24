import Logo from '../../../../../assets/crypto-coin-logo.svg?react';
import styles from '../../app-bar.module.css';

import { RunButton } from '@/features/integration/components/run-button/run-button';
import { SaveButton } from '@/features/integration/components/save-button/save-button';
import { OptionalAppBarTools } from '@/features/plugins-core/components/optional-app-bar-toolbar';

export function Toolbar() {
  return (
    <div className={styles.toolbar}>
      <Logo className={styles.logo} />
      <div className={styles['nav-segment']}>
        <OptionalAppBarTools>
          <SaveButton />
          <RunButton />
        </OptionalAppBarTools>
      </div>
    </div>
  );
}
