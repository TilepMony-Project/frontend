import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import type { TextAreaControlProps } from "../../types/controls";
import { createControlRenderer } from "../../utils/rendering";
import { ControlWrapper } from "../control-wrapper";

function TextAreaControl(props: TextAreaControlProps) {
  const { data, handleChange, path, enabled, uischema } = props;
  const { placeholder, minRows } = uischema;

  const [inputValue, setInputValue] = useState<string>(data);

  function onChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(event.target.value);
  }

  function onBlur() {
    handleChange(path, inputValue);
  }

  useEffect(() => {
    setInputValue(data);
  }, [data]);

  return (
    <ControlWrapper {...props}>
      <Textarea
        disabled={!enabled}
        value={inputValue}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        rows={minRows}
        className="min-h-[110px] rounded-xl border border-gray-200/80 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm transition-all duration-200 placeholder:text-gray-500 focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:border-primary/40 dark:border-gray-700 dark:bg-[#1c1c20] dark:text-gray-100 dark:placeholder:text-gray-500"
      />
    </ControlWrapper>
  );
}

export const textAreaControlRenderer = createControlRenderer("TextArea", TextAreaControl);
