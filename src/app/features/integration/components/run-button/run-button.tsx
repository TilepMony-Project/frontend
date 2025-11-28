import { Icon } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { showToast, ToastType } from "@/utils/toast-utils";

export function RunButton() {
  function handleRun() {
    showToast({
      title: "Workflow execution coming soon",
      subtitle: "Backend + smart contract integration is in progress.",
      variant: ToastType.INFO,
    });
  }

  return (
    <Tooltip content="Run workflow">
      <Button variant="ghost" size="icon" onClick={handleRun}>
        <Icon name="Play" />
      </Button>
    </Tooltip>
  );
}
