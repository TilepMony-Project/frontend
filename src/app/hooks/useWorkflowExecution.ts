import {
  ADDRESSES,
  CONTRACT_ABI,
  CONTRACT_ADDRESS,
  ERC20_ABI,
  VAULT_ABI,
} from "@/config/contractConfig";
import { usePrivySession } from "@/hooks/use-privy-session";
import useStore from "@/store/store";
import { decodeContractError } from "@/utils/error-decoder";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";
import { useCallback, useEffect, useState } from "react";
import { formatEther, formatUnits, parseEventLogs } from "viem";
import { usePublicClient, useWaitForTransactionReceipt, useWriteContract } from "wagmi";

export type ExecutionStatus =
  | "idle"
  | "preparing"
  | "checking-approval"
  | "signing-approval"
  | "processing-approval"
  | "estimating-gas"
  | "signing-execution"
  | "processing-execution"
  | "success"
  | "error";

export interface ExecutionResult {
  txHash?: string;
  status: ExecutionStatus;
  error?: string;
  executionId?: string;
  estimatedGasCost?: string;
  logs: string[];
}

export function useWorkflowExecution() {
  const { accessToken, user } = usePrivySession();
  useSmartWallets();
  const nodes = useStore((state) => state.nodes);
  const setLastExecutionRun = useStore((state) => state.setLastExecutionRun);

  // Execution state from global store
  const logs = useStore((state) => state.executionLogs);
  const status = useStore((state) => state.executionStatus) as ExecutionStatus;
  const estimatedGasCost = useStore((state) => state.estimatedGasCost);
  const setExecutionLogs = useStore((state) => state.setExecutionLogs);
  const setExecutionStatus = useStore((state) => state.setExecutionStatus);
  const setEstimatedGasCost = useStore((state) => state.setEstimatedGasCost);

  const [result, setResultState] = useState<{
    txHash?: string;
    executionId?: string;
    error?: string;
  }>({});
  const [targetNodeIds, setTargetNodeIds] = useState<string[]>([]);

  // Sync wrapper for backward compatibility with local state usage in the hook
  const setResult = (
    update: Partial<ExecutionResult> | ((prev: ExecutionResult) => ExecutionResult)
  ) => {
    const prev: ExecutionResult = {
      ...result,
      status: useStore.getState().executionStatus as ExecutionStatus,
      logs: useStore.getState().executionLogs,
      estimatedGasCost: useStore.getState().estimatedGasCost || undefined,
    };
    const next = typeof update === "function" ? update(prev) : { ...prev, ...update };

    // Always use the latest store state for comparison and update
    const currentStoreStatus = useStore.getState().executionStatus;
    if (next.status !== currentStoreStatus) setExecutionStatus(next.status);
    
    if (next.estimatedGasCost !== undefined) setEstimatedGasCost(next.estimatedGasCost || null);
    setResultState({
      txHash: next.txHash,
      executionId: next.executionId,
      error: next.error,
    });
  };

  const addLog = useCallback(
    (message: string) => {
      const timestamp = new Date().toLocaleTimeString();
      setExecutionLogs((prev) => [...prev, `[${timestamp}] ${message}`]);
    },
    [setExecutionLogs]
  );

  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const {
    data: receipt,
    isSuccess: isConfirmed,
    isError: isReverted,
    error: receiptError,
  } = useWaitForTransactionReceipt({
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
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            nodeUpdates: [{ nodeId, status }],
          }),
        });
      };

      if (
        isConfirmed &&
        status === "processing-execution" &&
        result.executionId &&
        accessToken &&
        receipt
      ) {
        try {
          addLog("Transaction confirmed! Finalizing execution...");
          // 1. Mark Deposit (off-chain) nodes as complete immediately
          const offChainNodes = nodes.filter((n) => {
            if (targetNodeIds.length > 0 && !targetNodeIds.includes(n.id)) return false;
            const type = n.data?.type || n.type;
            return type === "deposit";
          });

          for (const node of offChainNodes) {
            await updateNodeStatus(node.id, "complete");
          }

          // 2. Identify on-chain nodes and parse events
          const onChainNodes = nodes.filter((n) => {
            if (targetNodeIds.length > 0 && !targetNodeIds.includes(n.id)) return false;
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
            const log = logs.find((l) => (l.args as any).index === BigInt(i));
            const isNodeSuccess = log ? (log.args as any).success : true;

            await updateNodeStatus(node.id, isNodeSuccess ? "complete" : "failed");

            if (i < onChainNodes.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 800));
            }
          }

          // 3b. Yield Farming Simulation (Mock Exchange Rate)
          const yieldNodes = onChainNodes.filter((n) =>
            ["yield-deposit", "yield-withdraw"].includes((n.data?.type || n.type) as string)
          );

          if (yieldNodes.length > 0) {
            for (const node of yieldNodes) {
              const type = (node.data?.type || node.type) as string;
              const props = node.data?.properties as any;
              const token = props?.underlyingToken;
              const adapter = props?.yieldAdapter;

              let vaultAddress = null;
              if (token && token !== "DYNAMIC" && adapter) {
                if (adapter === "MethLabAdapter") {
                  vaultAddress = (ADDRESSES.YIELD.METHLAB.VAULTS as any)[token];
                } else if (adapter === "InitCapitalAdapter") {
                  vaultAddress = (ADDRESSES.YIELD.INIT_CAPITAL.POOLS as any)[token];
                } else if (adapter === "CompoundAdapter") {
                  vaultAddress = (ADDRESSES.YIELD.COMPOUND.COMETS as any)[token];
                }
              }

              if (vaultAddress) {
                try {
                  const newRate = type === "yield-deposit" ? BigInt(1100000) : BigInt(1000000);
                  await writeContractAsync({
                    address: vaultAddress,
                    abi: VAULT_ABI,
                    functionName: "setExchangeRate",
                    args: [newRate],
                  });
                  // Add small delay between simulations
                  await new Promise((resolve) => setTimeout(resolve, 500));
                } catch (simError) {
                  console.warn("Yield simulation failed (user rejected or error):", simError);
                }
              }
            }
          }

          // 4. Finalize overall status
          const payload = {
            status: "finished",
            transactionHash: result.txHash,
            totalGasUsed: receipt.gasUsed.toString(),
            gasPriceGwei: formatUnits(receipt.effectiveGasPrice, 9),
            nodeUpdates: nodes
              .filter((n) => targetNodeIds.length === 0 || targetNodeIds.includes(n.id))
              .map((n) => ({ nodeId: n.id, status: "complete" })),
          };

          await fetch(`/api/executions/${result.executionId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(payload),
          });

          setResult((prev) => ({ ...prev, status: "success" }));
        } catch (e) {
          console.error("Failed to finalize execution:", e);
        }
      } else if (
        isReverted &&
        status === "processing-execution" &&
        result.executionId &&
        accessToken
      ) {
        try {
          // On revert, mark all targeted nodes as failed
          const failedNodes = nodes
            .filter((n) => targetNodeIds.length === 0 || targetNodeIds.includes(n.id))
            .map((n) => ({ nodeId: n.id, status: "failed" }));

          await fetch(`/api/executions/${result.executionId}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
              status: "failed",
              transactionHash: result.txHash,
              nodeUpdates: failedNodes,
              error: receiptError?.message || "Transaction reverted",
            }),
          });
          setResult((prev) => ({ ...prev, status: "error", error: "Transaction reverted" }));
        } catch (e) {
          console.error("Failed to mark execution as failed:", e);
        }
      }
    };

    finalizeExecution();
  }, [isConfirmed, isReverted, result.executionId, accessToken, nodes, targetNodeIds]);

  const executeWorkflow = async (workflowId: string, nodeIds: string[] = []) => {
    try {
      setTargetNodeIds(nodeIds);
      setExecutionLogs([]);
      setExecutionStatus("preparing");
      addLog("Starting workflow execution...");

      if (!accessToken) throw new Error("Authentication token not ready");

      const walletAddress = user?.wallet?.address;
      if (!walletAddress) throw new Error("No wallet connected");

      // 1. Get Execution Config from Backend
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userWalletAddress: walletAddress, nodeIds }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to prepare execution");
      }

      const { config, executionId } = await response.json();
      addLog(`Execution prepared. ID: ${executionId.slice(0, 8)}...`);

      setResult({ status: "checking-approval", executionId });

      // Deserialize actions and enforce ABI structure
      const deserializedActions = config.actions.map((action: any) => ({
        actionType: Number(action.actionType), // Ensure number for uint8
        targetContract: action.targetContract as `0x${string}`,
        data: action.data as `0x${string}`,
        inputAmountPercentage: BigInt(action.inputAmountPercentage),
      }));

      // 1.5 Check Approval and Approve if needed
      if (
        config.initialToken &&
        config.initialToken !== "0x0000000000000000000000000000000000000000" &&
        BigInt(config.initialAmount) > BigInt(0)
      ) {
        if (!publicClient) throw new Error("Public Client not ready");

        const allowance = await publicClient.readContract({
          address: config.initialToken as `0x${string}`,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [walletAddress as `0x${string}`, CONTRACT_ADDRESS],
        });

        if (allowance < BigInt(config.initialAmount)) {
          addLog("Approval required. Please sign the approval transaction...");
          setResult((prev) => ({ ...prev, status: "signing-approval" }));
          const approveHash = await writeContractAsync({
            address: config.initialToken as `0x${string}`,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [CONTRACT_ADDRESS, BigInt(config.initialAmount)],
          });

          addLog(`Approval submitted: ${approveHash.slice(0, 10)}...`);
          setResult((prev) => ({ ...prev, status: "processing-approval" }));
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
          addLog("Approval confirmed!");
        } else {
          addLog("Sufficient approval already exists.");
        }
      }

      // 2. Estimate Gas
      addLog("Estimating gas cost...");
      setResult((prev) => ({ ...prev, status: "estimating-gas" }));

      let gasLimit: bigint | undefined;
      try {
        if (publicClient) {
          const gasEstimate = await publicClient.estimateContractGas({
            address: CONTRACT_ADDRESS,
            abi: CONTRACT_ABI,
            functionName: "executeWorkflow",
            args: [deserializedActions, config.initialToken, BigInt(config.initialAmount)],
            account: walletAddress as `0x${string}`,
          });

          // Add 20% buffer
          gasLimit = (gasEstimate * BigInt(120)) / BigInt(100);

          const gasPrice = await publicClient.getGasPrice();
          const estimatedCost = formatEther(gasLimit * gasPrice);
          addLog(`Estimated gas: ${estimatedCost} ETH (with 20% buffer)`);
          setResult((prev) => ({ ...prev, estimatedGasCost: estimatedCost }));
        }
      } catch (gasError) {
        addLog("Warning: Could not estimate gas. Using default limit.");
        console.warn("Gas estimation failed:", gasError);
      }

      // 3. Send Transaction
      addLog("Please sign the workflow execution transaction...");
      setResult((prev) => ({ ...prev, status: "signing-execution" }));

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "executeWorkflow",
        args: [deserializedActions, config.initialToken, BigInt(config.initialAmount)],
        ...(gasLimit ? { gas: gasLimit } : {}),
      });

      // 3. Update Execution Record with Tx Hash and mark nodes as processing
      await fetch(`/api/executions/${executionId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          status: "running",
          transactionHash: hash,
          nodeUpdates: nodes
            .filter((n) => nodeIds.length === 0 || nodeIds.includes(n.id))
            .map((n) => ({
              nodeId: n.id,
              status: "processing",
            })),
        }),
      });

      // Signal ExecutionMonitor to fetch the new execution data
      // This must happen AFTER the execution is created and updated
      setLastExecutionRun(Date.now());

      addLog(`Transaction submitted: ${hash.slice(0, 10)}...`);
      addLog("Waiting for blockchain confirmation...");
      setResult({ status: "processing-execution", txHash: hash, executionId });

      return { hash, executionId };
    } catch (error: any) {
      const errorMessage = decodeContractError(error);
      console.error("Workflow Execution Failed:", error);
      addLog(`Error: ${errorMessage}`);
      setResult((prev) => ({
        ...prev,
        status: "error",
        error: errorMessage,
      }));
      throw error;
    }
  };

  const simulateWorkflow = async (workflowId: string, nodeIds: string[] = []) => {
    try {
      if (!accessToken) throw new Error("Authentication token not ready");
      const walletAddress = user?.wallet?.address;
      if (!walletAddress) throw new Error("No wallet connected");

      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userWalletAddress: walletAddress, nodeIds }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to prepare simulation");
      }

      const { config, executionId } = await response.json();

      // 1.1 Get AI Explanation
      let aiExplanation = "";
      try {
        const aiResponse = await fetch("/api/ai/simulate-workflow", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            workflow: { nodes, edges: useStore.getState().edges },
            targetedNodes: config.targetedNodes,
          }),
        });
        if (aiResponse.ok) {
          const aiData = await aiResponse.json();
          aiExplanation = aiData.explanation;
        }
      } catch (aiError) {
        console.warn("AI simulation explanation failed:", aiError);
      }

      const deserializedActions = config.actions.map((action: any) => ({
        actionType: Number(action.actionType),
        targetContract: action.targetContract as `0x${string}`,
        data: action.data as `0x${string}`,
        inputAmountPercentage: BigInt(action.inputAmountPercentage),
      }));

      if (publicClient) {
        await publicClient.simulateContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "executeWorkflow",
          args: [deserializedActions, config.initialToken, BigInt(config.initialAmount)],
          account: walletAddress as `0x${string}`,
        });
      }

      return {
        success: true,
        actions: config.actions,
        initialToken: config.initialToken,
        initialAmount: config.initialAmount,
        targetedNodes: config.targetedNodes,
        aiExplanation,
        executionId,
      };
    } catch (error: any) {
      return {
        success: false,
        error: decodeContractError(error),
      };
    }
  };

  const resetExecution = useCallback(() => {
    setExecutionStatus("idle");
    setExecutionLogs([]);
    setEstimatedGasCost(null);
    setResultState({});
    setTargetNodeIds([]);
  }, [setExecutionStatus, setExecutionLogs, setEstimatedGasCost]);

  return {
    executeWorkflow,
    simulateWorkflow,
    resetExecution,
    status,
    txHash: result.txHash,
    error: result.error,
    executionId: result.executionId,
    estimatedGasCost,
    logs,
  };
}
