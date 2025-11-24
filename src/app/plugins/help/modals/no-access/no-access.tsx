import clsx from 'clsx';
import styles from './no-access.module.css';

export function NoAccess() {
  return (
    <div className={styles['container']}>
      <span className="ax-public-h6">Unlock Full Product Access</span>
      <span className={clsx('ax-public-p9', styles['sub-title'])}>Upgrade to access all features</span>
    </div>
  );
}
