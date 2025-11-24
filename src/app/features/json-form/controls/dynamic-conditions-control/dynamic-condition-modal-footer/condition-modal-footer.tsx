import { Button } from '@synergycodes/overflow-ui';

type Props = {
  closeModal: () => void;
  handleConfirm: () => void;
};

export function ConditionModalFooter({ closeModal, handleConfirm }: Props) {
  return (
    <>
      <Button variant="secondary" onClick={closeModal} type="button">
        Cancel
      </Button>
      <Button onClick={handleConfirm}>Confirm</Button>
    </>
  );
}
