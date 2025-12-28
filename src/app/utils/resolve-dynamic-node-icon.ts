/**
 * Utility to resolve dynamic node icon based on selected properties.
 * This allows node icons to change when user selects different providers/adapters.
 */

import { swapAdapterOptions } from "@/data/nodes/swap/schema";
import { yieldAdapterOptions } from "@/data/nodes/vault/schema";

// Map of node type to property key and options for dynamic icon resolution
const DYNAMIC_ICON_CONFIG: Record<
  string,
  {
    propertyKey: string;
    options: { value: string; icon?: string }[];
  }
> = {
  swap: {
    propertyKey: "swapAdapter",
    options: swapAdapterOptions,
  },
  vault: {
    propertyKey: "yieldAdapter",
    options: yieldAdapterOptions,
  },
};

/**
 * Resolves the icon to display for a node based on its type and properties.
 * If a dynamic icon is configured for the node type and a matching selection is found,
 * returns the icon for that selection. Otherwise, returns the default icon.
 *
 * @param nodeType - The type of node (e.g., "swap", "mint")
 * @param properties - The node's properties data
 * @param defaultIcon - The default icon to use if no dynamic icon is found
 * @returns The icon name to display
 */
export function resolveDynamicNodeIcon(
  nodeType: string | undefined,
  properties: Record<string, unknown> | undefined,
  defaultIcon: string
): string {
  if (!nodeType || !properties) {
    return defaultIcon;
  }

  const config = DYNAMIC_ICON_CONFIG[nodeType];
  if (!config) {
    return defaultIcon;
  }

  const selectedValue = properties[config.propertyKey];
  if (!selectedValue || typeof selectedValue !== "string") {
    return defaultIcon;
  }

  const matchingOption = config.options.find(
    (opt) => opt.value === selectedValue
  );
  if (matchingOption?.icon) {
    return matchingOption.icon;
  }

  return defaultIcon;
}
