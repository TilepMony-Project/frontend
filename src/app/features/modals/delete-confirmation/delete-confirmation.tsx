import type { Node, Edge } from '@xyflow/react';

import { Checkbox, Button } from '@synergycodes/overflow-ui';
import { useState } from 'react';

type DeleteConfirmationProps = {
  nodes: Node[];
  edges: Edge[];
  onShouldShowAgainChange?: (value: boolean) => void;
};

export function DeleteConfirmation({
  nodes,
  edges,
  onShouldShowAgainChange,
}: DeleteConfirmationProps) {
  const [isChecked, setIsChecked] = useState(false);

  const parts = [
    nodes.length > 0 ? (nodes.length > 1 ? 'nodes' : 'node') : '',
    edges.length > 0 ? (edges.length > 1 ? 'edges' : 'edge') : '',
  ].filter(Boolean);

  function handleChange() {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onShouldShowAgainChange?.(newValue);
  }

  const partsText = parts.join(' and connected ');
  const selectedText = nodes.length > 1 ? 'selected' : 'selected';

  return (
    <div className="flex flex-col gap-4">
      <span>
        Are you sure you want to delete <b>{selectedText}</b> {partsText}?
      </span>
      <div className="flex items-center gap-2">
        <Checkbox
          id="dont-show-again-checkbox"
          size="small"
          checked={isChecked}
          onChange={handleChange}
        />
        <label htmlFor="dont-show-again-checkbox">Don't show me this again</label>
      </div>
    </div>
  );
}

type DeleteConfirmationButtonsProps = {
  onDeleteClick: () => void;
  onCancelClick: () => void;
};

export function DeleteConfirmationButtons({
  onDeleteClick,
  onCancelClick,
}: DeleteConfirmationButtonsProps) {
  return (
    <div className="flex gap-2 justify-end">
      <Button variant="secondary" onClick={onCancelClick}>
        Cancel
      </Button>
      <Button onClick={onDeleteClick} size="medium" variant="error" autoFocus>
        Delete
      </Button>
    </div>
  );
}
