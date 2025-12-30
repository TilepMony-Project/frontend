import { useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/config/contractConfig";
import { usePrivySession } from "@/hooks/use-privy-session";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import useStore from "@/store/store";
import { parseEventLogs } from "viem";

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
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);

  const { writeContractAsync } = useWriteContract();

  const { data: receipt, isSuccess: isConfirmed, isError: isReverted, error: receiptError } = 
    useWaitForTransactionReceipt({
      hash: result.txHash as `0x${string}`,
    });

  // Handle transaction confirmation
  useEffect(() => {
    const finalizeExecution = async () => {
        const updateNodeStatus = async (nodeId: string, status: "complete" | "failed") => {
            await fetch(`/api/executions/${result.executionId}`, {
                method: "PATCH",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`
                },
                body: JSON.stringify({ 
                    nodeUpdates: [{ nodeId, status }]
                }),
            });
        };

        if (
            isConfirmed && 
            result.status === "processing" && 
            result.executionId && 
            accessToken && 
            receipt
        ) {
            try {
                // 1. Mark Deposit (off-chain) nodes as complete immediately
                const offChainNodes = nodes.filter(n => {
                    if (targetNodeId && n.id !== targetNodeId) return false;
                    const type = n.data?.type || n.type;
                    return type === "deposit";
                });

                for (const node of offChainNodes) {
                    await updateNodeStatus(node.id, "complete");
                }

                // 2. Identify on-chain nodes and parse events
                const onChainNodes = nodes.filter(n => {
                    if (targetNodeId && n.id !== targetNodeId) return false;
                    const type = n.data?.type || n.type;
                    return type !== "deposit";
                });

                const logs = parseEventLogs({
                    abi: CONTRACT_ABI,
                    logs: receipt.logs,
                    eventName: "ActionExecuted",
                });

                // 3. Sequential Animation for on-chain progress
                for (let i = 0; i < onChainNodes.length; i++) {
                    const node = onChainNodes[i];
                    // Map node index to action index in contract
                    const log = logs.find(l => (l.args as any).index === BigInt(i));
                    const isNodeSuccess = log ? (log.args as any).success : true;

                    await updateNodeStatus(node.id, isNodeSuccess ? "complete" : "failed");

                    if (i < onChainNodes.length - 1) {
                        await new Promise(resolve => setTimeout(resolve, 800));
                    }
                }

                // 4. Finalize overall status
                await fetch(`/api/executions/${result.executionId}`, {
                    method: "PATCH",
                    headers: { 
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ 
                        status: "finished",
                        transactionHash: result.txHash
                    }),
                });

                setResult(prev => ({ ...prev, status: "success" }));
            } catch (e) {
                console.error("Failed to finalize execution:", e);
            }
        } else if (isReverted && result.status === "processing" && result.executionId && accessToken) {
            try {
                // On revert, mark all targeted nodes as failed
                const failedNodes = nodes
                    .filter(n => !targetNodeId || n.id === targetNodeId)
                    .map(n => ({ nodeId: n.id, status: "failed" }));

                await fetch(`/api/executions/${result.executionId}`, {
                    method: "PATCH",
                    headers: { 
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`
                    },
                    body: JSON.stringify({ 
                        status: "failed",
                        transactionHash: result.txHash,
                        nodeUpdates: failedNodes,
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
      setTargetNodeId(nodeId || null);
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
            nodeUpdates: nodes
                .filter(n => !nodeId || n.id === nodeId)
                .map(n => ({
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
