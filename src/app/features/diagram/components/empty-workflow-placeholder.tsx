"use client";

import useStore from "@/store/store";
import { Plus } from "lucide-react";

/**
 * EmptyWorkflowPlaceholder - Shows when the workflow canvas is empty.
 * Displays a dashed box with "Add first step..." button similar to n8n.
 * Clicking opens the nodes library sidebar.
 */
export function EmptyWorkflowPlaceholder() {
  const toggleSidebar = useStore((state) => state.toggleSidebar);
  const isSidebarExpanded = useStore((state) => state.isSidebarExpanded);

  const handleClick = () => {
    // Only open sidebar if not already open
    if (!isSidebarExpanded) {
      toggleSidebar();
    }
  };

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
      <button
        type="button"
        onClick={handleClick}
        className="pointer-events-auto flex flex-col items-center gap-4 group cursor-pointer transition-all duration-300 focus:outline-none"
      >
        {/* Dashed box with plus icon */}
        <div className="flex items-center justify-center w-24 h-24 rounded-xl border-2 border-dashed border-gray-400 dark:border-gray-600 bg-transparent group-hover:border-primary group-hover:bg-primary/5 dark:group-hover:bg-primary/10 transition-all duration-300">
          <Plus className="w-10 h-10 text-gray-400 dark:text-gray-500 group-hover:text-primary transition-colors duration-300" />
        </div>

        {/* Label */}
        <span className="text-base font-medium text-gray-500 dark:text-gray-400 group-hover:text-primary transition-colors duration-300">
          Add first step...
        </span>
      </button>
    </div>
  );
}
