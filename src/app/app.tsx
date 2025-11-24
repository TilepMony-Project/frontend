'use client';

// Plugins entry point
import '@/features/plugins-core/index';
import type { PropsWithChildren } from 'react';

import useStore from '@/store/store';

import styles from './app.module.css';
import { AppBarContainerLazy } from './features/app-bar/app-bar-container-lazy';
import { DiagramContainer as Diagram } from './features/diagram/diagram';
import { DiagramWrapper } from './features/diagram/diagram-wrapper';
import { ExecutionMonitor } from './features/execution/components/execution-monitor/execution-monitor';
import { AppLoaderContainer } from './features/integration/components/app-loader/app-loader-container';
import { withIntegration } from './features/integration/components/with-integration';
import { PaletteContainerLazy } from './features/palette/palette-container-lazy';
import { OptionalHooks } from './features/plugins-core/components/optional-hooks';
import { PropertiesBarContainerLazy } from './features/properties-bar/properties-bar-container-lazy';
import { SnackbarContainer } from './features/snackbar/snackbar-container';

function AppComponent(_props: PropsWithChildren) {
  const selectedNodesCount = useStore((state) => state.selectedNodesIds.length);
  const selectedEdgesCount = useStore((state) => state.selectedEdgesIds.length);
  const hasSingleSelection = selectedNodesCount + selectedEdgesCount === 1;
  const isExecutionMonitorActive = useStore((state) => state.isExecutionMonitorActive);

  const shouldShowPropertiesPanel = hasSingleSelection && !isExecutionMonitorActive;
  const shouldShowRightPanel = isExecutionMonitorActive || shouldShowPropertiesPanel;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <AppBarContainerLazy />
      </div>
      <div className={styles.content}>
        <div className={styles.panel}>
          <PaletteContainerLazy />
        </div>
        {shouldShowRightPanel && (
          <div className={styles.panel}>
            <div className={styles['right-panel']}>
              {isExecutionMonitorActive ? <ExecutionMonitor /> : null}
              {shouldShowPropertiesPanel ? <PropertiesBarContainerLazy /> : null}
            </div>
          </div>
        )}
      </div>
      <DiagramWrapper>
        <Diagram />
      </DiagramWrapper>
      <SnackbarContainer />
      <AppLoaderContainer />
      <OptionalHooks />
    </div>
  );
}

type AppProps = React.ComponentProps<typeof AppComponent>;

// Check app/features/integration/README.md for more information
export const App = withIntegration<AppProps>(AppComponent);
