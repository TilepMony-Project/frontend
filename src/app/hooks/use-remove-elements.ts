import { trackFutureChange } from "@/features/changes-tracker/stores/use-changes-tracker-store";
import type { SingleSelectedElement } from "@/features/properties-bar/use-single-selected-element";
import { useReactFlow } from "@xyflow/react";

export function useRemoveElements() {
  const { deleteElements } = useReactFlow();

  function removeElements(selectedElement?: SingleSelectedElement | null) {
    if (!selectedElement) {
      return;
    }

    trackFutureChange("delete");

    deleteElements({
      nodes: selectedElement.node ? [selectedElement.node] : undefined,
      edges: selectedElement.edge ? [selectedElement.edge] : undefined,
    });
  }

  return { removeElements };
}
