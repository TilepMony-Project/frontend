import { Icon } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { showToast, ToastType } from "@/utils/toast-utils";

import { useExecutionSimulation } from "@/features/integration/hooks/use-execution-simulation";

export function RunButton() {
  const { runWorkflow } = useExecutionSimulation();

  function handleRun() {
    runWorkflow();
  }

  return (
    <Tooltip content="Run workflow">
      <Button variant="ghost" size="icon" onClick={handleRun}>
        <Icon name="Play" />
      </Button>
    </Tooltip>
  );
}
