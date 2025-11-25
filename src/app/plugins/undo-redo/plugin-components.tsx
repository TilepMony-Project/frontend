import { NavButton } from '@synergycodes/overflow-ui';

import { Icon } from '@/components/icons';
import { registerComponentDecorator } from '@/features/plugins-core/adapters/adapter-components';

import {
  canRedo,
  canUndo,
  redoWorkflowStep,
  undoWorkflowStep,
  useUndoRedoHistoryStore,
} from './history-store';

function UndoButton() {
  const hasPast = useUndoRedoHistoryStore((state) => state.past.length > 0);

  return (
    <NavButton tooltip="Undo" disabled={!hasPast} onClick={handleUndo}>
      <Icon name="Undo2" />
    </NavButton>
  );
}

function RedoButton() {
  const hasFuture = useUndoRedoHistoryStore((state) => state.future.length > 0);

  return (
    <NavButton tooltip="Redo" disabled={!hasFuture} onClick={handleRedo}>
      <Icon name="Redo2" />
    </NavButton>
  );
}

function handleUndo() {
  if (!canUndo()) {
    return;
  }
  undoWorkflowStep();
}

function handleRedo() {
  if (!canRedo()) {
    return;
  }
  redoWorkflowStep();
}

registerComponentDecorator('OptionalAppBarTools', {
  name: 'UndoButton',
  content: UndoButton,
  place: 'after',
  priority: 5,
});

registerComponentDecorator('OptionalAppBarTools', {
  name: 'RedoButton',
  content: RedoButton,
  place: 'after',
  priority: 4,
});
