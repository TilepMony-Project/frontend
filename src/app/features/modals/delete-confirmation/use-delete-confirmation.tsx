import useStore from "@/store/store";
import type { Edge, Node } from "@xyflow/react";
import { MinusCircle } from "lucide-react";
import { useCallback } from "react";
import { closeModal, openModal } from "../stores/use-modal-store";
import { DeleteConfirmation, DeleteConfirmationButtons } from "./delete-confirmation";

type Props = {
  nodes: Node[];
  edges: Edge[];
  onDeleteClick: () => void;
  onModalClosed: () => void;
};

export function useDeleteConfirmation() {
  const shouldSkipShowingConfirmation = useStore((state) => state.shouldSkipShowingConfirmation);
  const setShouldSkipShowDeleteConfirmation = useStore(
    (state) => state.setShouldSkipShowDeleteConfirmation
  );

  const handleDeleteClick = useCallback(
    (onDeleteClick: () => void, shouldShowAgain: boolean) => {
      if (shouldShowAgain) {
        setShouldSkipShowDeleteConfirmation(true);
      }
      onDeleteClick();
      closeModal();
    },
    [setShouldSkipShowDeleteConfirmation]
  );

  const openDeleteConfirmationModal = useCallback(
    ({ nodes, edges, onDeleteClick, onModalClosed }: Props) => {
      if (shouldSkipShowingConfirmation) {
        onDeleteClick();
        return;
      }

      let shouldShowAgain = false;

      openModal({
        content: (
          <DeleteConfirmation
            nodes={nodes}
            edges={edges}
            onShouldShowAgainChange={(value) => {
              shouldShowAgain = value;
            }}
          />
        ),
        footer: (
          <DeleteConfirmationButtons
            onCancelClick={closeModal}
            onDeleteClick={() => handleDeleteClick(onDeleteClick, shouldShowAgain)}
          />
        ),
        icon: <MinusCircle />,
        title: "Delete Selection",
        onModalClosed: onModalClosed,
      });
    },
    [handleDeleteClick, shouldSkipShowingConfirmation]
  );

  return { openDeleteConfirmationModal };
}
