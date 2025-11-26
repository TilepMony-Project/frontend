import { trackFutureChange } from "@/features/changes-tracker/stores/use-changes-tracker-store";
import type { Selection } from "@/types/selection";
import { useReactFlow } from "@xyflow/react";

export function useRemoveElements() {
  const { deleteElements } = useReactFlow();

  function removeElements(selectedElement?: Selection) {
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
