import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/icons";
import { useWorkflowExecution } from "@/hooks/useWorkflowExecution";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Simple markdown renderer for workflow explanations
function MarkdownText({ text }: { text: string }) {
  // Split by lines and process markdown-like formatting
  const lines = text.split("\n").filter((line) => line.trim());

  return (
    <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
      {lines.map((line, index) => {
        const trimmed = line.trim();

        // Bullet points (lines starting with - or •)
        if (trimmed.startsWith("-") || trimmed.startsWith("•")) {
          const content = trimmed.substring(1).trim();
          return (
            <div key={index} className="flex items-start gap-2 ml-4">
              <span className="text-blue-500">•</span>
              <span className="flex-1">{formatInlineMarkdown(content)}</span>
            </div>
          );
        }

        // Numbered steps (e.g., 1. Deposit)
        const numberedMatch = trimmed.match(/^(\d+)\.\s*(.*)/);
        if (numberedMatch) {
          return (
            <div key={index} className="mt-4 first:mt-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold font-serif">
                  {numberedMatch[1]}
                </span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {formatInlineMarkdown(numberedMatch[2])}
                </span>
              </div>
            </div>
          );
        }

        // Regular paragraph
        return (
          <p key={index} className="pl-0">
            {formatInlineMarkdown(trimmed)}
          </p>
        );
      })}
    </div>
  );
}

// Format inline markdown (bold, code, etc.)
function formatInlineMarkdown(text: string) {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;

  // Pattern for **bold** text
  const boldPattern = /\*\*(.+?)\*\*/g;
  // Pattern for `code` text
  const codePattern = /`([^`]+)`/g;
  // Pattern for addresses (0x...)
  const addressPattern = /(0x[a-fA-F0-9]{40})/g;
  // Pattern for currency amounts ($XXX, XXX USD, etc.)
  const amountPattern = /(\$[\d,]+(?:\.\d+)?|[\d,]+(?:\.\d+)?\s*(?:USD|IDR|USDC|USDT|IDRX))/gi;

  // Combine all patterns
  const allMatches: Array<{
    start: number;
    end: number;
    type: string;
    content: string;
  }> = [];

  let match;
  while ((match = boldPattern.exec(text)) !== null) {
    allMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: "bold",
      content: match[1],
    });
  }
  while ((match = codePattern.exec(text)) !== null) {
    allMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: "code",
      content: match[1],
    });
  }
  while ((match = addressPattern.exec(text)) !== null) {
    allMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: "address",
      content: match[0],
    });
  }
  while ((match = amountPattern.exec(text)) !== null) {
    allMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      type: "amount",
      content: match[0],
    });
  }

  // Sort by start position
  allMatches.sort((a, b) => a.start - b.start);

  // Build parts
  allMatches.forEach((m) => {
    // Only process if it starts after the current index to avoid overlapping matches
    if (m.start >= currentIndex) {
      if (m.start > currentIndex) {
        parts.push(text.substring(currentIndex, m.start));
      }

      if (m.type === "bold") {
        parts.push(
          <strong
            key={`bold-${m.start}`}
            className="font-semibold text-gray-900 dark:text-gray-100"
          >
            {m.content}
          </strong>
        );
      } else if (m.type === "code") {
        parts.push(
          <code
            key={`code-${m.start}`}
            className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-800 rounded text-xs font-mono"
          >
            {m.content}
          </code>
        );
      } else if (m.type === "address") {
        parts.push(
          <code
            key={`addr-${m.start}`}
            className="px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs font-mono"
          >
            {m.content}
          </code>
        );
      } else if (m.type === "amount") {
        parts.push(
          <span
            key={`amount-${m.start}`}
            className="font-semibold text-green-700 dark:text-green-400"
          >
            {m.content}
          </span>
        );
      }

      currentIndex = m.end;
    }
  });

  if (currentIndex < text.length) {
    parts.push(text.substring(currentIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}

interface TargetedNode {
  id: string;
  type: string;
  label: string;
  properties?: any;
}

interface SimulationResult {
  success: boolean;
  actions?: any[];
  initialToken?: string;
  initialAmount?: string;
  targetedNodes?: TargetedNode[];
  aiExplanation?: string;
  error?: string;
}

interface ApprovalStatus {
  needsApproval: boolean;
  currentAllowance: string;
  requiredAmount: string;
  tokenAddress: string;
  tokensNeedingApproval?: { address: string; currentAllowance: string; requiredAmount: string }[];
}

type ModalStep = "checking-approval" | "needs-approval" | "approving" | "simulating" | "done";

export function ExecutionConfirmationModal({
  open,
  onClose,
  onConfirm,
  workflowId,
  selectedNodeIds,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  workflowId: string;
  selectedNodeIds: string[];
}) {
  const { simulateWorkflow, checkApproval, requestApproval } = useWorkflowExecution();
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus | null>(null);
  const [currentStep, setCurrentStep] = useState<ModalStep>("checking-approval");
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [approvalProgress, setApprovalProgress] = useState<{
    current: number;
    total: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      // Reset state
      setCurrentStep("checking-approval");
      setSimulationResult(null);
      setApprovalStatus(null);
      setApprovalError(null);
      setApprovalProgress(null);

      // Start the flow: check approval first
      checkApproval(workflowId, selectedNodeIds)
        .then((result) => {
          setApprovalStatus(result);
          if (result.needsApproval) {
            const total = result.tokensNeedingApproval?.length || 1;
            setApprovalProgress({ current: 1, total });
            setCurrentStep("needs-approval");
          } else {
            // No approval needed, proceed to simulation
            setCurrentStep("simulating");
            return simulateWorkflow(workflowId, selectedNodeIds);
          }
        })
        .then((simResult) => {
          if (simResult) {
            setSimulationResult(simResult);
            setCurrentStep("done");
          }
        })
        .catch((error) => {
          console.error("Workflow preparation failed:", error);
          setSimulationResult({
            success: false,
            error: error.message || "Failed to prepare workflow",
          });
          setCurrentStep("done");
        });
    }
  }, [open, workflowId, selectedNodeIds]);

  const handleApprove = async () => {
    if (!approvalStatus?.tokenAddress) return;

    setCurrentStep("approving");
    setApprovalError(null);

    const result = await requestApproval(approvalStatus.tokenAddress);

    if (result.success) {
      // Approval successful, re-check if more approvals are needed
      try {
        const newCheck = await checkApproval(workflowId, selectedNodeIds);
        setApprovalStatus(newCheck);

        if (newCheck.needsApproval) {
          // More tokens need approval
          const total = approvalProgress?.total || 1;
          const current = total - (newCheck.tokensNeedingApproval?.length || 0) + 1;
          setApprovalProgress({ current, total });
          setCurrentStep("needs-approval");
        } else {
          // All approvals done, proceed to simulation
          setApprovalProgress(null);
          setCurrentStep("simulating");
          const simResult = await simulateWorkflow(workflowId, selectedNodeIds);
          setSimulationResult(simResult);
          setCurrentStep("done");
        }
      } catch (error: any) {
        console.error("Re-check approval failed:", error);
        setSimulationResult({
          success: false,
          error: error.message || "Failed to verify approval",
        });
        setCurrentStep("done");
      }
    } else {
      // Approval failed
      setApprovalError(result.error || "Approval was rejected");
      setCurrentStep("needs-approval");
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const isLoading =
    currentStep === "checking-approval" ||
    currentStep === "simulating" ||
    currentStep === "approving";
  const canConfirm = currentStep === "done" && simulationResult?.success;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Simulate Workflow"
      size="extra-large"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={currentStep === "approving"}>
            Cancel
          </Button>
          {currentStep === "needs-approval" ? (
            <Button
              variant="default"
              onClick={handleApprove}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Icon name="Key" className="mr-2" size={16} />
              Approve Token
            </Button>
          ) : (
            <Button
              variant="default"
              onClick={handleConfirm}
              disabled={!canConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Confirm & Run
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        {/* Step Progress Indicator */}
        <div className="flex items-center gap-2 text-sm">
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full",
              currentStep === "checking-approval"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            )}
          >
            {currentStep === "checking-approval" ? (
              <Icon name="Loader2" className="animate-spin" size={14} />
            ) : (
              <Icon name="Check" size={14} />
            )}
            <span>Check Approval</span>
          </div>
          <Icon name="ChevronRight" size={14} className="text-gray-400" />
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full",
              currentStep === "checking-approval"
                ? "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                : currentStep === "needs-approval" || currentStep === "approving"
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
            )}
          >
            {currentStep === "approving" ? (
              <Icon name="Loader2" className="animate-spin" size={14} />
            ) : currentStep === "needs-approval" ? (
              <Icon name="Key" size={14} />
            ) : currentStep !== "checking-approval" ? (
              <Icon name="Check" size={14} />
            ) : (
              <Icon name="Key" size={14} />
            )}
            <span>Approve</span>
          </div>
          <Icon name="ChevronRight" size={14} className="text-gray-400" />
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-full",
              currentStep === "simulating"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                : currentStep === "done"
                  ? simulationResult?.success
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
            )}
          >
            {currentStep === "simulating" ? (
              <Icon name="Loader2" className="animate-spin" size={14} />
            ) : currentStep === "done" ? (
              simulationResult?.success ? (
                <Icon name="Check" size={14} />
              ) : (
                <Icon name="X" size={14} />
              )
            ) : (
              <Icon name="Play" size={14} />
            )}
            <span>Simulate</span>
          </div>
        </div>

        {/* Approval Needed Message */}
        {(currentStep === "needs-approval" || currentStep === "approving") && (
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/30">
            <div className="flex gap-3">
              <Icon
                name="AlertTriangle"
                className="text-amber-600 dark:text-amber-400 mt-0.5"
                size={20}
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                    Token Approval Required
                  </p>
                  {approvalProgress && approvalProgress.total > 1 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                      {approvalProgress.current} / {approvalProgress.total}
                    </span>
                  )}
                </div>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                  This workflow requires spending your tokens. Please approve the token spending to
                  continue with the simulation.
                </p>
                {approvalStatus && (
                  <div className="mt-2 text-xs text-amber-600 dark:text-amber-500 font-mono">
                    Token: {approvalStatus.tokenAddress.slice(0, 10)}...
                    {approvalStatus.tokenAddress.slice(-8)}
                  </div>
                )}
                {approvalError && (
                  <div className="mt-2 text-xs text-red-600 dark:text-red-400">
                    ⚠️ {approvalError}
                  </div>
                )}
                {currentStep === "approving" && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <Icon name="Loader2" className="animate-spin" size={14} />
                    Waiting for wallet confirmation...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* AI Explanation */}
        {currentStep === "done" && (
          <div>
            <div className="p-4 rounded-xl bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
              {simulationResult?.aiExplanation ? (
                <MarkdownText text={simulationResult.aiExplanation} />
              ) : (
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Reviewing the technical steps for financial impact...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loading States */}
        {(currentStep === "checking-approval" || currentStep === "simulating") && (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-4 w-[90%] animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-4 w-[95%] animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
          </div>
        )}

        {/* Simulation Result */}
        {currentStep === "done" && (
          <div
            className={cn(
              "p-4 rounded-xl border flex gap-3",
              simulationResult?.success
                ? "bg-green-50 border-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400"
                : "bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400"
            )}
          >
            {simulationResult?.success ? (
              <Icon name="ShieldCheck" className="mt-0.5" size={18} />
            ) : (
              <Icon name="AlertCircle" className="mt-0.5" size={18} />
            )}
            <div>
              <p className="text-sm font-bold">
                {simulationResult?.success ? "Simulation Successful" : "Simulation Failed"}
              </p>
              <p className="text-xs opacity-90 leading-relaxed mt-1">
                {simulationResult?.success
                  ? "The workflow is valid and safe to execute. No reverts detected."
                  : simulationResult?.error ||
                    "An error occurred during simulation. Please check your workflow configuration."}
              </p>
            </div>
          </div>
        )}

        {/* Status Message for Loading States */}
        {(currentStep === "checking-approval" || currentStep === "simulating") && (
          <div className="p-4 rounded-xl border bg-gray-50 border-gray-100 text-gray-500 flex gap-3">
            <Icon name="Loader2" className="animate-spin mt-0.5" size={18} />
            <div>
              <p className="text-sm font-bold">
                {currentStep === "checking-approval"
                  ? "Checking Token Approval..."
                  : "Simulating Workflow..."}
              </p>
              <p className="text-xs opacity-90 leading-relaxed mt-1">
                {currentStep === "checking-approval"
                  ? "Verifying if token approval is required for this workflow..."
                  : "Verifying steps and gas requirements on-chain..."}
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
