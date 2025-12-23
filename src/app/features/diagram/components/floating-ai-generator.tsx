"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Sparkles, Loader2 } from "lucide-react";
import { showToast, ToastType } from "@/utils/toast-utils";
import {
  workflowTemplates,
  type WorkflowTemplate,
} from "@/features/dashboard/data/templates";
import useStore from "@/store/store";
import type {
  WorkflowBuilderNode,
  WorkflowBuilderEdge,
} from "@/types/node-data";
import { useFitView } from "@/hooks/use-fit-view";
import { getNodeWithErrors } from "@/utils/validation/get-node-errors";
import type { NodeAddChange, EdgeAddChange } from "@xyflow/react";
import { trackFutureChange } from "@/features/changes-tracker/stores/use-changes-tracker-store";

/**
 * Template keyword mapping for reliable AI generation.
 * Each template has keywords that when matched, will select that template.
 */
const TEMPLATE_KEYWORDS: Record<string, string[]> = {
  "cross-border-treasury-transfer": [
    "idr",
    "usd",
    "cross-border",
    "treasury",
    "transfer",
    "partition",
    "vault",
    "bridge",
    "mantle",
    "multi-branch",
    "split",
    "corporate wallet",
  ],
  "automated-onramp-investment-vault": [
    "onramp",
    "investment",
    "vault",
    "yield",
    "target",
    "usdc",
    "on-ramp",
    "invest",
    "bank transfer",
    "hold",
  ],
  "scheduled-salary-distribution": [
    "salary",
    "payroll",
    "employee",
    "schedule",
    "monthly",
    "distribution",
    "wages",
    "pay",
    "recurring",
  ],
  "corporate-invoice-settlement": [
    "invoice",
    "settlement",
    "supplier",
    "payment",
    "due date",
    "b2b",
    "business",
    "settle",
  ],
};

/**
 * Finds the best matching template based on user prompt.
 * Falls back to cross-border-treasury-transfer as default.
 */
function findMatchingTemplate(prompt: string): WorkflowTemplate {
  const lowerPrompt = prompt.toLowerCase();
  let bestMatch: { templateId: string; score: number } = {
    templateId: "cross-border-treasury-transfer",
    score: 0,
  };

  for (const [templateId, keywords] of Object.entries(TEMPLATE_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerPrompt.includes(keyword.toLowerCase())) {
        score += keyword.length; // Longer keywords = more specific = higher score
      }
    }
    if (score > bestMatch.score) {
      bestMatch = { templateId, score };
    }
  }

  // Find the actual template
  const template = workflowTemplates.find((t) => t.id === bestMatch.templateId);
  return template || workflowTemplates[0]; // Fallback to first template
}

/**
 * Generates unique IDs for nodes and edges to avoid conflicts
 */
function regenerateIds(template: WorkflowTemplate): {
  nodes: WorkflowBuilderNode[];
  edges: WorkflowBuilderEdge[];
} {
  const idSuffix = Date.now().toString(36);
  const nodeIdMap = new Map<string, string>();

  // Create new node IDs
  const nodes = template.nodes.map((node) => {
    const newId = `${node.id}-${idSuffix}`;
    nodeIdMap.set(node.id, newId);
    return getNodeWithErrors({
      ...node,
      id: newId,
      selected: false,
    });
  });

  // Update edge IDs and references
  const edges = template.edges.map((edge) => ({
    ...edge,
    id: `${edge.id}-${idSuffix}`,
    source: nodeIdMap.get(edge.source) || edge.source,
    target: nodeIdMap.get(edge.target) || edge.target,
    sourceHandle: edge.sourceHandle?.replace(
      edge.source,
      nodeIdMap.get(edge.source) || edge.source
    ),
    targetHandle: edge.targetHandle?.replace(
      edge.target,
      nodeIdMap.get(edge.target) || edge.target
    ),
  }));

  return { nodes, edges };
}

interface FloatingAIGeneratorProps {
  className?: string;
}

/**
 * FloatingAIGenerator - A floating button in bottom-right corner that opens
 * an AI workflow generator modal using template matching.
 * Always succeeds by matching user intent to existing templates.
 */
export function FloatingAIGenerator({
  className = "",
}: FloatingAIGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const onNodesChange = useStore((state) => state.onNodesChange);
  const onEdgesChange = useStore((state) => state.onEdgesChange);
  const nodes = useStore((state) => state.nodes);
  const fitView = useFitView();

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      showToast({
        title: "Prompt required",
        subtitle: "Please describe the workflow you want to create",
        variant: ToastType.ERROR,
      });
      return;
    }

    setIsGenerating(true);

    // Simulate brief processing time for UX
    await new Promise((resolve) => setTimeout(resolve, 800));

    try {
      // Find matching template based on keywords
      const matchedTemplate = findMatchingTemplate(prompt);

      // Regenerate IDs to avoid conflicts with existing nodes
      const { nodes: newNodes, edges: newEdges } =
        regenerateIds(matchedTemplate);

      // Track this as a change for undo/redo
      trackFutureChange("aiGenerate");

      // If workflow has existing nodes, offset new nodes to not overlap
      let finalNodes = newNodes;
      if (nodes.length > 0) {
        const offsetX = Math.max(...nodes.map((n) => n.position.x)) + 400;
        finalNodes = newNodes.map((node) => ({
          ...node,
          position: {
            x: node.position.x + offsetX,
            y: node.position.y,
          },
        }));
      }

      // Create node add changes
      const nodeAddChanges: NodeAddChange<WorkflowBuilderNode>[] =
        finalNodes.map((node) => ({
          type: "add" as const,
          item: node,
        }));

      // Create edge add changes
      const edgeAddChanges: EdgeAddChange<WorkflowBuilderEdge>[] = newEdges.map(
        (edge) => ({
          type: "add" as const,
          item: edge,
        })
      );

      // Apply changes
      onNodesChange(nodeAddChanges);
      onEdgesChange(edgeAddChanges);

      showToast({
        title: "Workflow generated!",
        subtitle: `Created workflow based on "${matchedTemplate.name}"`,
        variant: ToastType.SUCCESS,
      });

      setIsOpen(false);
      setPrompt("");

      // Fit view to show new nodes
      setTimeout(() => fitView(), 100);
    } catch (error) {
      console.error("Error generating workflow:", error);
      showToast({
        title: "Generation failed",
        subtitle: error instanceof Error ? error.message : "Please try again",
        variant: ToastType.ERROR,
      });
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, nodes, onNodesChange, onEdgesChange, fitView]);

  return (
    <>
      {/* Floating Button */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={() => setIsOpen(true)}
          className="gap-2 px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border-0"
          size="lg"
        >
          <Sparkles size={18} className="text-white" />
          <span className="text-white font-medium">Generate with AI</span>
        </Button>
      </div>

      {/* Modal */}
      <Modal
        open={isOpen}
        onClose={isGenerating ? undefined : () => setIsOpen(false)}
        title="Generate Workflow with AI"
        size="large"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={18} className="animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} className="mr-2" />
                  Generate Workflow
                </>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe your workflow
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the fiat-to-fiat flow you want..."
              className="min-h-[150px]"
              disabled={isGenerating}
            />
            <p className="text-xs text-muted-foreground mt-2">
              Describe what you want to achieve. The AI will select the best
              matching workflow template.
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Available workflow patterns:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                <strong>Cross-border transfer:</strong> "IDR to USD",
                "treasury", "partition", "vault"
              </li>
              <li>
                <strong>Investment vault:</strong> "on-ramp", "investment",
                "yield target"
              </li>
              <li>
                <strong>Salary distribution:</strong> "payroll", "salary",
                "employee", "monthly"
              </li>
              <li>
                <strong>Invoice settlement:</strong> "invoice", "supplier", "B2B
                payment"
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
}
