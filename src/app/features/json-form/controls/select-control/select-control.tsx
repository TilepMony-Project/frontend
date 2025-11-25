import type { SelectControlProps } from '../../types/controls';

import { createControlRenderer } from '../../utils/rendering';
import { Select, type SelectBaseProps } from '@synergycodes/overflow-ui';
import { ControlWrapper } from '../control-wrapper';
import type { PrimitiveFieldSchema } from '@/types/node-schema';
import { Icon } from '@/components/icons';

function SelectControl(props: SelectControlProps) {
  const { data, handleChange, path, enabled, schema } = props;

  const items = ((schema as PrimitiveFieldSchema).options as any[])?.map((option) =>
    option.type === 'separator' || !option.icon
      ? option
      : {
          ...option,
          icon: <Icon name={option.icon} size="small" />,
        }
  );

  const onChange: SelectBaseProps['onChange'] = (_event, value) => {
    handleChange(path, value);
  };

  return (
    <ControlWrapper {...props}>
      <Select
        value={data ?? null}
        items={items ?? []}
        disabled={!enabled}
        onChange={onChange}
        placeholder={schema.placeholder}
      />
    </ControlWrapper>
  );
}

export const selectControlRenderer = createControlRenderer('Select', SelectControl);
