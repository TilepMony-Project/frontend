"use client";

// Plugins entry point
import "@/features/plugins-core/index";
import type { PropsWithChildren } from "react";

import useStore from "@/store/store";

import { AppBarContainerLazy } from "./features/app-bar/app-bar-container-lazy";
import { DiagramContainer as Diagram } from "./features/diagram/diagram";
import { DiagramWrapper } from "./features/diagram/diagram-wrapper";
import { ExecutionMonitor } from "./features/execution/components/execution-monitor/execution-monitor";
import { AppLoaderContainer } from "./features/integration/components/app-loader/app-loader-container";
import { withIntegration } from "./features/integration/components/with-integration";
import { PaletteContainerLazy } from "./features/palette/palette-container-lazy";
import { OptionalHooks } from "./features/plugins-core/components/optional-hooks";
import { PropertiesBarContainerLazy } from "./features/properties-bar/properties-bar-container-lazy";

type AppComponentProps = PropsWithChildren<{
  workflowId?: string | null;
}>;

function AppComponent(_props: AppComponentProps) {
  const selectedNodesCount = useStore((state) => state.selectedNodesIds.length);
  const selectedEdgesCount = useStore((state) => state.selectedEdgesIds.length);
  const hasSingleSelection = selectedNodesCount + selectedEdgesCount === 1;
  const isExecutionMonitorActive = useStore((state) => state.isExecutionMonitorActive);

  const shouldShowPropertiesPanel = hasSingleSelection && !isExecutionMonitorActive;
  const shouldShowRightPanel = isExecutionMonitorActive || shouldShowPropertiesPanel;

  return (
    <div className="absolute flex flex-col h-full w-full overflow-hidden">
      <DiagramWrapper>
        <Diagram />
      </DiagramWrapper>

      <div className="fixed top-0 left-0 right-0 z-[50] flex justify-between box-border w-full p-4 gap-4 pointer-events-none">
        <AppBarContainerLazy />
      </div>
      <div className="fixed inset-0 top-[6.5rem] px-4 pb-4 box-border flex justify-between overflow-hidden pointer-events-none z-[40]">
        <div className="h-full flex pointer-events-auto">
          <PaletteContainerLazy />
        </div>
        {shouldShowRightPanel && (
          <div className="h-full flex pointer-events-auto">
            <div className="flex flex-col gap-4 items-end justify-between">
              {isExecutionMonitorActive ? <ExecutionMonitor /> : null}
              {shouldShowPropertiesPanel ? <PropertiesBarContainerLazy /> : null}
            </div>
          </div>
        )}
      </div>

      <AppLoaderContainer />
      <OptionalHooks />
    </div>
  );
}

type AppProps = React.ComponentProps<typeof AppComponent>;

// Check app/features/integration/README.md for more information
export const App = withIntegration<AppProps>(AppComponent);
