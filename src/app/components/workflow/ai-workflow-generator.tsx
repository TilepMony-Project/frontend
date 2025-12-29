"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal } from "@/components/ui/modal";
import { Icon } from "@/components/icons";
import { Sparkles, Loader2 } from "lucide-react";
import { showToast, ToastType } from "@/utils/toast-utils";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";

interface AIWorkflowGeneratorProps {
  onWorkflowGenerated?: (workflow: any) => void;
}

export function AIWorkflowGenerator({
  onWorkflowGenerated,
}: AIWorkflowGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const { getAccessToken } = usePrivy();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      showToast({
        title: "Prompt required",
        subtitle: "Please describe the workflow you want to create",
        variant: ToastType.ERROR,
      });
      return;
    }

    setIsGenerating(true);

    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error("Authentication required");
      }

      const response = await fetch("/api/ai/generate-workflow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate workflow");
      }

      const { workflow } = await response.json();

      // Create the workflow via API
      const createResponse = await fetch("/api/workflows", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: workflow.workflowName,
          description: workflow.workflowDescription,
          nodes: workflow.nodes,
          edges: workflow.edges,
        }),
      });

      if (!createResponse.ok) {
        throw new Error("Failed to create workflow");
      }

      const { workflow: createdWorkflow } = await createResponse.json();

      showToast({
        title: "Workflow generated!",
        subtitle: `Created "${workflow.workflowName}"`,
        variant: ToastType.SUCCESS,
      });

      setIsOpen(false);
      setPrompt("");

      if (onWorkflowGenerated) {
        onWorkflowGenerated(createdWorkflow);
      } else {
        // Navigate to workspace
        router.push(`/workspace/${createdWorkflow._id || createdWorkflow.id}`);
      }
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
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2 min-w-[180px] px-6 py-3 text-base rounded-full border-[1px] border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500"
        size="lg"
      >
        <Sparkles size={18} />
        Generate with AI
      </Button>

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
              placeholder="Describe the fiat-to-fiat flow you want to create. The AI will generate the appropriate nodes and connections."
              className="min-h-[150px]"
              disabled={isGenerating}
            />
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Example prompts:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                "Deposit 10,000 USD, mint to stablecoin, wait 7 days, then
                redeem to USD"
              </li>
              <li>
                "Create a stablecoin workflow: deposit IDR → mint → vault with 120
                mUSDT target → partition 60/40 to transfer and redeem"
              </li>
              <li>
                "I need to receive USD, convert to stablecoin, bridge to Mantle,
                then transfer to wallet 0xABC"
              </li>
            </ul>
          </div>
        </div>
      </Modal>
    </>
  );
}
