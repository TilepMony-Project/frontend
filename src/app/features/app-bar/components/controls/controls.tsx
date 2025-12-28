"use client";

import { Button } from "@/components/ui/button";
import { Menu, type MenuItemProps } from "@/components/ui/menu";
import { Tooltip } from "@/components/ui/tooltip";
import { Icon } from "@/components/icons";
import { CanvasToolToggle } from "@/features/app-bar/components/toolbar/canvas-tool-toggle";
import { OptionalAppBarControls } from "@/features/plugins-core/components/optional-app-bar-controls";
import { ToggleDarkMode } from "../toggle-dark-mode/toggle-dark-mode";
import { ToggleReadyOnlyMode } from "../toggle-read-only-mode/toggle-read-only-mode";
import { getControlsDotsItems } from "../../functions/get-controls-dots-items";
import { MoreVertical, Play, Loader2 } from "lucide-react";
import { useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";
import { cn } from "@/lib/utils";
import { useWorkflowValidation } from "@/hooks/useWorkflowValidation";
import { toast } from "sonner";

// ... imports

export function Controls() {
  const items: MenuItemProps[] = useMemo(() => getControlsDotsItems(), []);
  const router = useRouter();
  const params = useParams();
  const workflowId = params?.workflowId as string;

  const {
    executeWorkflow,
    status,
    error: executionError,
  } = useWorkflowExecution();
  const { validateWorkflow, validating } = useWorkflowValidation();

  const isExecuting =
    status === "preparing" ||
    status === "signing" ||
    status === "processing" ||
    validating;

  const handleExecute = async () => {
    if (!workflowId) return;

    // 1. Validate
    const validation = await validateWorkflow(workflowId);

    if (!validation) {
      toast.error("Validation failed to run");
      return;
    }

    if (!validation.valid) {
      toast.error("Workflow has errors", {
        description: validation.errors.map((e) => e.message).join("\n"),
        duration: 5000,
      });
      return;
    }

    if (validation.warnings.length > 0) {
      toast.warning("Workflow has warnings", {
        description: validation.warnings.map((w) => w.message).join("\n"),
        duration: 4000,
      });
    }

    // 2. Execute
    try {
      await executeWorkflow(workflowId);
    } catch (e: any) {
      toast.error("Execution failed", {
        description: e.message || "Unknown error",
      });
    }
  };

  return (
    <div className="flex justify-end items-center gap-4">
      {workflowId && (
        <Button
          size="sm"
          className={cn(
            "gap-2 font-medium bg-blue-600 hover:bg-blue-700 text-white border-none transition-all",
            isExecuting && "opacity-80 cursor-not-allowed"
          )}
          onClick={handleExecute}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4 fill-white" />
          )}
          {validating
            ? "Validating..."
            : status === "signing"
            ? "Sign in Wallet"
            : status === "processing"
            ? "Processing"
            : "Execute Contract"}
        </Button>
      )}

      <OptionalAppBarControls>
        <CanvasToolToggle />
        <ToggleReadyOnlyMode />
        <ToggleDarkMode />
      </OptionalAppBarControls>
      {items.length > 0 && (
        <div className="relative">
          <Menu items={items}>
            <Button variant="ghost" size="icon">
              <MoreVertical />
            </Button>
          </Menu>
        </div>
      )}
    </div>
  );
}
