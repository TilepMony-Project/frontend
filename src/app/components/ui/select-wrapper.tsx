import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
  icon?: React.ReactNode;
  type?: 'separator';
  disabled?: boolean;
};

export type SelectProps = {
  value?: string | null;
  onChange?: (event: any, value: string) => void;
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
      <SelectTrigger className={cn("transition-all duration-200 hover:border-ring/50", error && "border-destructive", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item, index) => {
          if (item.type === 'separator') {
            return <SelectSeparator key={index} />;
          }
          return (
            <SelectItem key={item.value} value={item.value} disabled={item.disabled}>
              <div className="flex items-center gap-2">
                {item.icon && <span className="w-4 h-4 flex items-center justify-center">{item.icon}</span>}
                {item.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
