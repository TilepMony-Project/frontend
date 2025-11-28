import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { useContext } from "react";
import { useAutoSave } from "../../hooks/use-auto-save";
import { useAutoSaveOnClose } from "../../hooks/use-auto-save-on-close";
import { IntegrationContext } from "../integration-variants/context/integration-context-wrapper";
import { SavingStatus } from "../saving-status/saving-status";

export function SaveButton() {
  const { onSave } = useContext(IntegrationContext);

  function handleSave() {
    onSave({ isAutoSave: false });
  }

  useAutoSave();
  useAutoSaveOnClose();

  return (
    <Tooltip content="Save workflow">
      <Button onClick={handleSave} variant="ghost" size="icon" className="relative">
        <Icon name="Save" />
        <span className="absolute right-0 top-0 z-10">
          <SavingStatus />
        </span>
      </Button>
    </Tooltip>
  );
}
