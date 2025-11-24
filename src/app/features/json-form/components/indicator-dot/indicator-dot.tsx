import styles from './indicator-dot.module.css';
import type { PropsWithChildren } from 'react';

export function IndicatorDot({ children }: PropsWithChildren) {
  return <div className={styles['with-indicator-dot']}>{children}</div>;
}
