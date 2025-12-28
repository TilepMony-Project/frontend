import { useState } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "@/config/contractConfig";
import { usePrivy } from "@privy-io/react-auth";
import { useSmartWallets } from "@privy-io/react-auth/smart-wallets";

export interface ExecutionResult {
  txHash?: string;
  status: "idle" | "preparing" | "signing" | "processing" | "success" | "error";
  error?: string;
  executionId?: string;
}

export function useWorkflowExecution() {
  const { user } = usePrivy();
  const { client } = useSmartWallets();
  const [result, setResult] = useState<ExecutionResult>({ status: "idle" });

  const { writeContractAsync, isPending: isSigning } = useWriteContract();

  const executeWorkflow = async (workflowId: string) => {
    try {
      setResult({ status: "preparing" });

      const walletAddress = user?.wallet?.address;
      if (!walletAddress) throw new Error("No wallet connected");

      // 1. Get Execution Config from Backend
      const response = await fetch(`/api/workflows/${workflowId}/execute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userWalletAddress: walletAddress }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to prepare execution");
      }

      const { config, executionId } = await response.json();
      
      setResult({ status: "signing", executionId });

      // 2. Send Transaction
      // We use wagmi's writeContractAsync which handles the provider/signer
      // Note: If using Privy Smart Wallets, we might need `client.writeContract`?
      // But we wrapped app in WagmiProvider with injected connector (which Privy supports).
      // So wagmi hook should work IF the connector is active.

      // If user is logged in via Privy embedded wallet, the wagmi connector should be 'privy'.
      // Let's assume standard wagmi flow works.

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "executeWorkflow",
        args: [
            config.actions, 
            config.initialToken, 
            BigInt(config.initialAmount)
        ],
      });

      // 3. Update Execution Record with Tx Hash
      await fetch(`/api/executions/${executionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            status: "running", 
            transactionHash: hash 
        }),
      });

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
