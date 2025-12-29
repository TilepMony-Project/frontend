import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/config/contractConfig";
import { usePrivySession } from "@/hooks/use-privy-session";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import useStore from "@/store/store";

export interface ExecutionResult {
  txHash?: string;
  status: "idle" | "preparing" | "signing" | "processing" | "success" | "error";
  error?: string;
  executionId?: string;
}

export function useWorkflowExecution() {
  const { accessToken, user } = usePrivySession();
  const { client } = useSmartWallets();
  const nodes = useStore((state) => state.nodes);
  const setLastExecutionRun = useStore((state) => state.setLastExecutionRun);
  const [result, setResult] = useState<ExecutionResult>({ status: "idle" });

  const { writeContractAsync } = useWriteContract();

  const { data: receipt, isSuccess: isConfirmed, isError: isReverted, error: receiptError } = 
    useWaitForTransactionReceipt({
      hash: result.txHash as `0x${string}`,
    });

  // Handle transaction confirmation
  useEffect(() => {
    const finalizeExecution = async () => {
        if (isConfirmed && result.executionId && accessToken) {
            try {
                // Update overall status and all nodes to complete
                await fetch(`/api/executions/${result.executionId}`, {
                    method: "PATCH",
                    headers: { 
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ 
                        status: "finished",
                        transactionHash: result.txHash,
                        nodeUpdates: nodes.map(n => ({
                            nodeId: n.id,
                            status: "complete"
                        }))
                    }),
                });
                setResult(prev => ({ ...prev, status: "success" }));
            } catch (e) {
                console.error("Failed to finalize execution:", e);
            }
        } else if (isReverted && result.executionId && accessToken) {
            try {
                await fetch(`/api/executions/${result.executionId}`, {
                    method: "PATCH",
                    headers: { 
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ 
                        status: "failed",
                        error: receiptError?.message || "Transaction reverted"
                    }),
                });
                setResult(prev => ({ ...prev, status: "error", error: "Transaction reverted" }));
            } catch (e) {
                console.error("Failed to mark execution as failed:", e);
            }
        }
    };

    finalizeExecution();
  }, [isConfirmed, isReverted, result.executionId, accessToken, nodes]);

  const executeWorkflow = async (workflowId: string, nodeId?: string) => {
    try {
      setResult({ status: "preparing" });

      if (!accessToken) throw new Error("Authentication token not ready");

      const walletAddress = user?.wallet?.address;
      if (!walletAddress) throw new Error("No wallet connected");

      // 1. Get Execution Config from Backend
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ userWalletAddress: walletAddress, nodeId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to prepare execution");
      }

      const { config, executionId } = await response.json();
      
      setResult({ status: "signing", executionId });

      // Deserialize actions from API (strings back to BigInt)
      const deserializedActions = config.actions.map((action: any) => ({
        ...action,
        inputAmountPercentage: BigInt(action.inputAmountPercentage),
      }));

      // 2. Send Transaction
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "executeWorkflow",
        args: [
            deserializedActions, 
            config.initialToken, 
            BigInt(config.initialAmount)
        ],
      });

      // 3. Update Execution Record with Tx Hash and mark nodes as processing
      await fetch(`/api/executions/${executionId}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ 
            status: "running", 
            transactionHash: hash,
            nodeUpdates: nodes.map(n => ({
                nodeId: n.id,
                status: "processing"
            }))
        }),
      });

      // Signal ExecutionMonitor to fetch the new execution data
      // This must happen AFTER the execution is created and updated
      setLastExecutionRun(Date.now());

      setResult({ status: "processing", txHash: hash, executionId });
      
      return { hash, executionId };

    } catch (error: any) {
      console.error("Workflow Execution Failed:", error);
      setResult((prev) => ({
        ...prev,
        status: "error",
        error: error.message || "Execution failed",
      }));
      throw error;
    }
  };

  return {
    executeWorkflow,
    status: result.status,
    txHash: result.txHash,
    error: result.error,
    executionId: result.executionId,
  };
}
