import { noop } from '@/utils/noop';

import { Toolbar } from './components/toolbar/toolbar';
import { ProjectSelection } from './components/project-selection/project-selection';
import { Controls } from './components/controls/controls';

export function AppBarContainer() {
  return (
    <div className="bg-[var(--ax-ui-bg-primary-default)] rounded-[var(--ax-token-radius-shell)] border border-[var(--ax-ui-stroke-primary-default)] flex h-auto px-4 py-3 pointer-events-auto w-full items-center justify-between">
      <Toolbar />
      <ProjectSelection onDuplicateClick={noop} />
      <Controls />
    </div>
  );
}
