import type { DecisionBranch } from '@/features/json-form/types/controls';
import { ConnectableItem } from '../../components/connectable-item/connectable-item';
import { NodeSection } from '../../components/node-section/node-section';
import { PlaceholderButton } from '../../components/placeholder-button/placeholder-button';
import type { LayoutDirection } from '@/types/common';
import styles from './branches-container.module.css';
import clsx from 'clsx';

type Props = {
  nodeId: string;
  decisionBranches: DecisionBranch[];
  layoutDirection?: LayoutDirection;
};

export function BranchesContainer({ nodeId, decisionBranches, layoutDirection }: Props) {
  // Branches should be displayed vertically when layout direction is horizontal (sic!)
  const isListVertical = layoutDirection === 'RIGHT';

  const branchesCount = decisionBranches.length;

  return (
    <NodeSection label="Branches">
      <div className={clsx(styles['branches-container'], { [styles['vertical']]: isListVertical })}>
        {decisionBranches.map(({ index }) => (
          <ConnectableItem
            key={index}
            label={`Branch ${index}`}
            nodeId={nodeId}
            innerId={index.toString()}
            handleType="source"
          />
        ))}
        {branchesCount === 0 && <PlaceholderButton label="Add Branch" />}
      </div>
    </NodeSection>
  );
}
