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
  const amountPattern =
    /(\$[\d,]+(?:\.\d+)?|[\d,]+(?:\.\d+)?\s*(?:USD|IDR|USDC|USDT|IDRX))/gi;

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
  const { simulateWorkflow } = useWorkflowExecution();
  const [simulationResult, setSimulationResult] =
    useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      setLoading(true);
      setSimulationResult(null);
      simulateWorkflow(workflowId, selectedNodeIds).then((res) => {
        setSimulationResult(res);
        setLoading(false);
      });
    }
  }, [open, workflowId, selectedNodeIds]);

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Simulate Workflow"
      size="extra-large"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleConfirm}
            disabled={loading || !simulationResult?.success}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Confirm & Run
          </Button>
        </div>
      }
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
        <div>
          {loading ? (
            <div className="space-y-2">
              <div className="h-4 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-4 w-[90%] animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
              <div className="h-4 w-[95%] animate-pulse bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-blue-50/30 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-900/20">
              {simulationResult?.aiExplanation ? (
                <MarkdownText text={simulationResult.aiExplanation} />
              ) : (
                <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Reviewing the technical steps for financial impact...
                </div>
              )}
            </div>
          )}
        </div>

        <div
          className={cn(
            "p-4 rounded-xl border flex gap-3",
            loading
              ? "bg-gray-50 border-gray-100 text-gray-500"
              : simulationResult?.success
              ? "bg-green-50 border-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-900/30 dark:text-green-400"
              : "bg-red-50 border-red-100 text-red-800 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400"
          )}
        >
          {loading ? (
            <Icon name="Loader2" className="animate-spin mt-0.5" size={18} />
          ) : simulationResult?.success ? (
            <Icon name="ShieldCheck" className="mt-0.5" size={18} />
          ) : (
            <Icon name="AlertCircle" className="mt-0.5" size={18} />
          )}
          <div>
            <p className="text-sm font-bold">
              {loading
                ? "Simulating Workflow..."
                : simulationResult?.success
                ? "Simulation Successful"
                : "Simulation Failed"}
            </p>
            <p className="text-xs opacity-90 leading-relaxed mt-1">
              {loading
                ? "Verifying steps and gas requirements on-chain..."
                : simulationResult?.success
                ? "The workflow is valid and safe to execute. No reverts detected."
                : simulationResult?.error ||
                  "An error occurred during simulation. Please check your workflow configuration."}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
