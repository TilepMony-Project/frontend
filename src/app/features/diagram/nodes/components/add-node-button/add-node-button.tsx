"use client";

import { memo, useCallback, useState } from "react";
import { Plus } from "lucide-react";
import useStore from "@/store/store";
import { cn } from "@/lib/utils";
import type { LayoutDirection } from "@/types/common";

interface AddNodeButtonProps {
  nodeId: string;
  layoutDirection?: LayoutDirection;
  className?: string;
  side?: "left" | "right";
}

/**
 * AddNodeButton - A [+] button that appears next to the source handle of each node.
 * When clicked, it opens the Nodes Library sidebar so users can drag and drop
 * a new node to connect to this one.
 */
export const AddNodeButton = memo(
  ({
    nodeId,
    layoutDirection = "horizontal",
    className,
    side = "right",
  }: AddNodeButtonProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const toggleSidebar = useStore((state) => state.toggleSidebar);
    const isSidebarExpanded = useStore((state) => state.isSidebarExpanded);
    const isReadOnlyMode = useStore((state) => state.isReadOnlyMode);

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent node selection
        // Open sidebar if not already open
        if (!isSidebarExpanded) {
          toggleSidebar();
        }
      },
      [isSidebarExpanded, toggleSidebar]
    );

    // Don't show in read-only mode
    if (isReadOnlyMode) {
      return null;
    }

    // Position based on layout direction
    const isHorizontal = layoutDirection === "horizontal";

    return (
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "absolute z-20 flex items-center justify-center",
          "w-6 h-6 rounded-md",
          "bg-gray-200 dark:bg-gray-700",
          "hover:bg-primary hover:scale-110",
          "border border-gray-300 dark:border-gray-600",
          "hover:border-primary",
          "text-gray-500 dark:text-gray-400",
          "hover:text-white",
          "transition-all duration-200 ease-in-out",
          "shadow-sm hover:shadow-md",
          "cursor-pointer",
          // Position relative to handle
          isHorizontal
            ? side === "left"
              ? "left-[-40px] top-1/2 -translate-y-1/2"
              : "right-[-40px] top-1/2 -translate-y-1/2"
            : "bottom-[-40px] left-1/2 -translate-x-1/2", // TODO: Vertical support for left? Vertical usually doesn't have left/right sides for flow.
          // Show/hide with opacity for subtle effect
          "opacity-0 group-hover:opacity-100",
          isHovered && "opacity-100 scale-110",
          className
        )}
        title="Add node"
        aria-label="Add a new node"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
      </button>
    );
  }
);

AddNodeButton.displayName = "AddNodeButton";
