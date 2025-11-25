import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ReactNode, SyntheticEvent } from 'react';

export type SelectOption = {
  label: string;
  value: string;
  icon?: ReactNode;
  type?: 'separator';
  disabled?: boolean;
};

export type SelectProps = {
  value?: string | null;
  onChange?: (event: SyntheticEvent | null, value: string) => void;
  items: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
};

export function SelectWrapper({
  value,
  onChange,
  items,
  placeholder,
  disabled,
  error,
  className,
}: SelectProps) {
  const handleValueChange = (newValue: string) => {
    if (onChange) {
      onChange(null, newValue);
    }
  };

  return (
    <Select value={value || undefined} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          'h-12 w-full rounded-xl border border-gray-200/80 bg-white px-4 text-left text-sm text-gray-900 shadow-sm transition-all duration-200 hover:border-gray-300 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40 dark:border-gray-700 dark:bg-[#1c1c20] dark:text-gray-100',
          error && 'border-destructive focus-visible:ring-destructive',
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl border border-gray-200/80 bg-white p-1 text-sm shadow-xl dark:border-gray-700 dark:bg-[#1c1c20]">
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <SelectSeparator key={`separator-${item.value ?? index}`} />;
          }
          return (
            <SelectItem
              key={item.value}
              value={item.value}
              disabled={item.disabled}
              className="cursor-pointer rounded-lg px-3 py-2 text-gray-900 outline-none focus:bg-gray-100 focus:text-gray-900 data-[state=checked]:bg-gray-100 data-[state=checked]:text-gray-900 dark:text-gray-100 dark:focus:bg-[#24252a] dark:data-[state=checked]:bg-[#24252a]"
            >
              <div className="flex items-center gap-2">
                {item.icon && (
                  <span className="flex h-4 w-4 items-center justify-center text-gray-500">
                    {item.icon}
                  </span>
                )}
                {item.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
