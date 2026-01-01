import { Icon } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { truncateText } from "@/utils/toast-utils";

import { IntegrationContext } from "@/features/integration/components/integration-variants/context/integration-context-wrapper";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";
import { useWorkflowValidation } from "@/hooks/useWorkflowValidation";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useContext } from "react";
import { toast } from "sonner";

export function RunButton() {
  const params = useParams();
  const workflowId = params?.workflowId as string;

  const { executeWorkflow, status } = useWorkflowExecution();
  const { validateWorkflow, validating } = useWorkflowValidation();
  const { onSave } = useContext(IntegrationContext);

  const isExecuting =
    status === "preparing" ||
    status === "checking-approval" ||
    status === "signing-approval" ||
    status === "processing-approval" ||
    status === "estimating-gas" ||
    status === "signing-execution" ||
    status === "processing-execution" ||
    validating;

  async function handleRun() {
    if (!workflowId) return;

    // 0. Auto-save first to ensure backend has latest data
    const saveResult = await onSave({ isAutoSave: false });

    if (saveResult === "error") {
      toast.error("Failed to save workflow before execution");
      return;
    }

    // 1. Validate
    const validation = await validateWorkflow(workflowId);

    if (!validation) {
      toast.error("Validation failed to run");
      return;
    }

    if (!validation.valid) {
      toast.error("Workflow has errors", {
        description: truncateText(validation.errors.map((e) => e.message).join("\n")),
        duration: 5000,
      });
      return;
    }

    if (validation.warnings.length > 0) {
      toast.warning("Workflow has warnings", {
        description: truncateText(validation.warnings.map((w) => w.message).join("\n")),
        duration: 4000,
      });
    }

    // 2. Execute
    try {
      await executeWorkflow(workflowId);
    } catch (e: any) {
      toast.error("Execution failed", {
        description: truncateText(e.message || "Unknown error"),
      });
    }
  }

  let tooltipText = "Run workflow";
  if (validating) tooltipText = "Validating...";
  else if (status === "signing-approval" || status === "signing-execution")
    tooltipText = "Sign in Wallet...";
  else if (status === "processing-approval" || status === "processing-execution")
    tooltipText = "Processing...";
  else if (status === "estimating-gas") tooltipText = "Estimating gas...";
  else if (status === "checking-approval") tooltipText = "Checking approval...";

  return (
    <Tooltip content={tooltipText}>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleRun}
        disabled={isExecuting}
        className={cn(isExecuting && "opacity-70")}
      >
        {isExecuting ? (
          <Icon name="Loader2" className="animate-spin text-blue-600" />
        ) : (
          <Icon name="Play" />
        )}
      </Button>
    </Tooltip>
  );
}
