import clsx from 'clsx';
import { useCallback, useMemo, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { DynamicCondition, DynamicConditionsControlProps } from '../../types/controls';
import { createControlRenderer } from '../../utils/rendering';
import { ControlWrapper } from '../control-wrapper';
import {
  ConditionsForm,
  type ConditionsFormHandle,
} from './dynamic-conditions-form/conditions-form';
import { Icon } from '@/components/icons';

import { conditionsToDependencies } from '../../utils/conditional-transform';
import { ConditionModalFooter } from './dynamic-condition-modal-footer/condition-modal-footer';
import { closeModal, openModal } from '@/features/modals/stores/use-modal-store';

function DynamicConditionsControl(props: DynamicConditionsControlProps) {
  const { data = [], handleChange, path, enabled } = props;
  const formRef = useRef<ConditionsFormHandle>(null);

  const dependencies = useMemo(() => {
    return conditionsToDependencies(data);
  }, [data]);

  const onChange = useCallback(
    (value: DynamicCondition[]) => {
      handleChange(path, value);
    },
    [handleChange, path]
  );

  const handleConfirm = useCallback(() => {
    formRef.current?.handleConfirm();
  }, []);

  const openEditorModal = useCallback(() => {
    openModal({
      content: <ConditionsForm ref={formRef} onChange={onChange} value={data} />,
      title: 'Conditions',
      footer: <ConditionModalFooter closeModal={closeModal} handleConfirm={handleConfirm} />,
    });
  }, [data, onChange, formRef, handleConfirm]);

  return (
    <div className="p-2 border border-[var(--wb-conditions-form-border-color)] rounded-[var(--wb-conditions-form-border-radius)]">
      <div className="flex justify-between items-center gap-1.5 mb-3 font-semibold text-[var(--wb-conditions-form-header-color)]">
        <span className={clsx('ax-public-h10', 'leading-none')}>Conditions</span>
        <Button size="sm" variant="ghost" onClick={openEditorModal}>
          <Icon name="FrameCorners" size={16} />
        </Button>
      </div>
      <ControlWrapper {...props} uischema={{ ...props.uischema, label: 'Dependencies' }}>
        <Textarea
          disabled={!enabled}
          value={dependencies.join(' ')}
          onClick={openEditorModal}
        />
        <span className="ax-public-p10 py-1 px-2 rounded bg-[var(--wb-conditions-form-tag-bg-color)] mr-auto">{data.length} total</span>
      </ControlWrapper>
    </div>
  );
}

export const dynamicConditionsControlRenderer = createControlRenderer(
  'DynamicConditions',
  DynamicConditionsControl
);
