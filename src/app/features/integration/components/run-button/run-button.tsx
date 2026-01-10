import { Icon } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { truncateText } from "@/utils/toast-utils";

import { IntegrationContext } from "@/features/integration/components/integration-variants/context/integration-context-wrapper";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";
import { useWorkflowValidation } from "@/hooks/useWorkflowValidation";
import useStore from "@/store/store";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { ExecutionConfirmationModal } from "./execution-confirmation-modal";

export function RunButton() {
  const params = useParams();
  const workflowId = params?.workflowId as string;

  const { executeWorkflow, status } = useWorkflowExecution();
  const { validateWorkflow, validating } = useWorkflowValidation();
  const { onSave } = useContext(IntegrationContext);
  const selectedNodesIds = useStore((state) => state.selectedNodesIds);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const isExecuting =
    status === "preparing" ||
    status === "checking-approval" ||
    status === "signing-approval" ||
    status === "processing-approval" ||
    status === "estimating-gas" ||
    status === "signing-execution" ||
    status === "processing-execution" ||
    validating;

  async function handleRunClick() {
    if (!workflowId) return;

    // 0. Auto-save first
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

    // 2. Open confirmation modal instead of executing
    setShowConfirmation(true);
  }

  async function handleConfirmExecution() {
    try {
      await executeWorkflow(workflowId, selectedNodesIds);
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
    <>
      <Tooltip content={tooltipText}>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRunClick}
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

      <ExecutionConfirmationModal
        open={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmExecution}
        workflowId={workflowId}
        selectedNodeIds={selectedNodesIds}
      />
    </>
  );
}
