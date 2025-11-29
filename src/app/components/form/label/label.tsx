import clsx from "clsx";

import { Asterisk } from "lucide-react";
// Define ItemSize type locally to replace SynergyCode type
export type ItemSize = "small" | "medium" | "large";

export type LabelProps = {
  label: string;
  required?: boolean;
  size?: ItemSize;
};

export function Label({ label, required, size = "medium" }: LabelProps) {
  return (
    <span
      className={clsx(
        "flex gap-1 text-gray-700 dark:text-gray-300 items-center",
        size === "large" ? "text-[14px] font-medium" : "text-[12px] font-medium"
      )}
    >
      {required && <Asterisk className="w-2.5 h-2.5 min-w-[0.625rem] text-red-500" />}
      <span className="whitespace-nowrap overflow-hidden text-ellipsis w-full">{label}</span>
    </span>
  );
}
