import { Icon } from '@/components/icons';
import { SelectWrapper as Select, type SelectProps } from '@/components/ui/select-wrapper';
import type { ItemOption, PrimitiveFieldSchema } from '@/types/node-schema';
import type { SelectControlProps } from '../../types/controls';
import { createControlRenderer } from '../../utils/rendering';
import { ControlWrapper } from '../control-wrapper';

function SelectControl(props: SelectControlProps) {
  const { data, handleChange, path, enabled, schema } = props;

  const items = ((schema as PrimitiveFieldSchema).options as ItemOption[] | undefined)?.map(
    (option) =>
      option.type === 'separator' || !option.icon
        ? option
        : {
            ...option,
            icon: <Icon name={option.icon} size="small" />,
          }
  );

  const onChange: SelectProps['onChange'] = (_event, value) => {
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
        className="h-12 rounded-xl border border-gray-200/80 bg-white px-4 text-sm text-gray-900 shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40 dark:border-gray-700 dark:bg-[#1c1c20] dark:text-gray-100"
      />
    </ControlWrapper>
  );
}

export const selectControlRenderer = createControlRenderer('Select', SelectControl);
