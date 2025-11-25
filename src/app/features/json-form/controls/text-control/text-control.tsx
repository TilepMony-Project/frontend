import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import type { TextControlProps } from '../../types/controls';
import { createControlRenderer } from '../../utils/rendering';
import { ControlWrapper } from '../control-wrapper';

function TextControl(props: TextControlProps) {
  const { schema, uischema, enabled, data, required, errors, path, handleChange } = props;

  const { type } = schema;
  const { placeholder } = uischema;

  const isNumberInput = type === 'number';
  const hasErrors = errors.length > 0;

  const [inputValue, setInputValue] = useState<string>('');

  useEffect(() => {
    if (data == null) {
      setInputValue('');
    } else {
      setInputValue(String(data));
    }
  }, [data]);

  function onChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
  }

  function onBlur() {
    const trimmed = inputValue.trim();

    if (trimmed === '') {
      // eslint-disable-next-line unicorn/no-useless-undefined
      handleChange(path, undefined);
    } else if (isNumberInput) {
      const number_ = Number(trimmed);
      handleChange(path, Number.isNaN(number_) ? undefined : number_);
    } else {
      handleChange(path, trimmed);
    }
  }

  return (
    <ControlWrapper {...props}>
      <Input
        type={isNumberInput ? 'number' : 'text'}
        required={required}
        value={inputValue}
        onChange={onChange}
        onBlur={onBlur}
        error={hasErrors}
        disabled={!enabled}
        placeholder={placeholder}
        inputMode={isNumberInput ? 'decimal' : undefined}
        className="h-12 rounded-xl border border-gray-200/80 bg-white px-4 text-sm text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40 dark:border-gray-700 dark:bg-[#1c1c20] dark:text-gray-100 dark:placeholder:text-gray-500"
      />
    </ControlWrapper>
  );
}

export const textControlRenderer = createControlRenderer('Text', TextControl);
