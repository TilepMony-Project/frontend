import styles from './branch-card.module.css';
import clsx from 'clsx';
import { NavButton } from '@synergycodes/overflow-ui';
import { SlidersHorizontal, Trash2 } from 'lucide-react';
import { useCallback, useRef } from 'react';
import {
  ConditionsForm,
  ConditionsFormHandle,
} from '../../dynamic-conditions-control/dynamic-conditions-form/conditions-form';
import { DecisionBranch } from '@/features/json-form/types/controls';
import { ConditionModalFooter } from '../../dynamic-conditions-control/dynamic-condition-modal-footer/condition-modal-footer';
import { closeModal, openModal } from '@/features/modals/stores/use-modal-store';

type Props = {
  branch: DecisionBranch;
  onUpdate: (branch: DecisionBranch) => void;
  onRemove: (index: number) => void;
};

export function BranchCard({ branch, onUpdate, onRemove }: Props) {
  const formRef = useRef<ConditionsFormHandle>(null);
  const { conditions, index } = branch;
  const conditionCount = conditions.length;
  const conditionText = getConditionText();
  const hasNoConditions = conditionCount === 0;

  const handleConfirm = useCallback(() => {
    formRef.current?.handleConfirm();
  }, []);

  const openEditorModal = useCallback(
    ({ conditions }: DecisionBranch) => {
      openModal({
        content: (
          <ConditionsForm
            ref={formRef}
            onChange={(updatedConditions) => onUpdate({ index, conditions: updatedConditions })}
            value={conditions}
          />
        ),
        title: 'Conditions',
        footer: <ConditionModalFooter closeModal={closeModal} handleConfirm={handleConfirm} />,
      });
    },
    [handleConfirm, onUpdate, index]
  );

  const onClickEdit = useCallback(() => openEditorModal(branch), [branch, openEditorModal]);
  const onClickRemove = useCallback(() => onRemove(branch.index), [onRemove, branch]);

  return (
    <div className={styles['branch-card']}>
      <div className={styles['header']}>
        <h1 className="ax-public-h10">Branch {index}</h1>
        <div className={styles['actions']}>
          <NavButton onClick={onClickEdit}>
            <SlidersHorizontal />
          </NavButton>
          <NavButton onClick={onClickRemove}>
            <Trash2 />
          </NavButton>
        </div>
      </div>
      <div
        className={clsx(
          styles['conditions-chip'],
          { [styles['no-conditions']]: hasNoConditions },
          'ax-public-p11'
        )}
      >
        {conditionText}
      </div>
    </div>
  );

  function getConditionText() {
    if (conditionCount === 1) {
      return '1 condition';
    } else if (conditionCount > 1) {
      return `${conditionCount} conditions`;
    } else {
      return 'No conditions';
    }
  }
}
