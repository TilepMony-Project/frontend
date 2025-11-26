import type { SingleSelectedElement } from "../../use-single-selected-element";
import type { PropertiesBarItem } from "./properties-bar.types";

export function renderComponent(
  componentMap: PropertiesBarItem[],
  selection: SingleSelectedElement | null,
  selectedTab: string
) {
  if (!selection) {
    return null;
  }

  return componentMap
    .find(({ when }) => when({ selection, selectedTab }))
    ?.component({ selection, selectedTab });
}
