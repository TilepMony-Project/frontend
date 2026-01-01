"use client";

import { Icon } from "@/components/icons";
import { Tooltip } from "@/components/ui/tooltip";
import useStore from "@/store/store";
import clsx from "clsx";
import { useMemo } from "react";

type CanvasTool = {
  id: "select" | "pan";
  label: string;
  icon: string;
};

export function CanvasToolToggle() {
  const mode = useStore((state) => state.canvasInteractionMode);
  const setMode = useStore((state) => state.setCanvasInteractionMode);

  const tools: CanvasTool[] = useMemo(
    () => [
      { id: "select", label: "Select Tool", icon: "Pointer" },
      { id: "pan", label: "Hand Tool", icon: "Hand" },
    ],
    []
  );

  return (
    <div className="flex rounded-full border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#1c1c20]">
      {tools.map((tool, index) => (
        <Tooltip key={tool.id} content={tool.label}>
          <button
            type="button"
            onClick={() => setMode(tool.id)}
            aria-pressed={mode === tool.id}
            aria-label={tool.label}
            className={clsx(
              "flex items-center gap-1 px-3 h-8 text-sm transition-colors",
              index === 0 && "rounded-l-full",
              index === tools.length - 1 && "rounded-r-full",
              mode === tool.id
                ? "bg-[#1296e7] text-white shadow-sm"
                : "text-gray-600 hover:bg-[#eeeff3] dark:text-gray-300 dark:hover:bg-[#2c2d31]"
            )}
          >
            <Icon name={tool.icon} size={16} />
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
