import {
  createPublicClient,
  createWalletClient,
  http,
  decodeAbiParameters,
  type PublicClient,
  type WalletClient,
  type Chain,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mantleSepoliaTestnet, baseSepolia } from "viem/chains";
import {
  TOKEN_HYP_ERC20_ABI,
  MAIN_CONTROLLER_ABI,
  BRIDGE_EXECUTOR_CONFIG,
  INITIAL_LOOKBACK_BLOCKS,
  MAX_GAS_LIMIT,
} from "./config";
import type { PendingWorkflow, WorkflowDataReceivedEvent, WorkflowAction } from "./types";

// In-memory storage for pending workflows (use Redis/DB in production)
const pendingWorkflows = new Map<string, PendingWorkflow>();
const lastCheckedBlock = new Map<number, bigint>();

// Chain ID to viem Chain mapping
const CHAIN_MAP: Record<number, Chain> = {
  5003: mantleSepoliaTestnet,
  84532: baseSepolia,
};

/**
 * Get executor wallet from environment
 */
function getExecutorAccount() {
  const privateKey = process.env.BRIDGE_EXECUTOR_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("BRIDGE_EXECUTOR_PRIVATE_KEY not set in environment");
  }
  return privateKeyToAccount(privateKey as `0x${string}`);
}

/**
 * Create public client for a chain
 */
function getPublicClient(chainId: number) {
  const config = BRIDGE_EXECUTOR_CONFIG.chains[chainId];
  if (!config) {
    throw new Error(`Chain ${chainId} not configured`);
  }

  const chain = CHAIN_MAP[chainId];
  if (!chain) {
    throw new Error(`Chain ${chainId} not supported`);
  }

  return createPublicClient({
    chain,
    transport: http(config.rpcUrl),
  });
}

/**
 * Create wallet client for a chain
 */
function getWalletClient(chainId: number) {
  const config = BRIDGE_EXECUTOR_CONFIG.chains[chainId];
  if (!config) {
    throw new Error(`Chain ${chainId} not configured`);
  }

  const chain = CHAIN_MAP[chainId];
  if (!chain) {
    throw new Error(`Chain ${chainId} not supported`);
  }

  const account = getExecutorAccount();

  return createWalletClient({
    account,
    chain,
    transport: http(config.rpcUrl),
  });
}

/**
 * Poll for WorkflowDataReceived events on a specific chain
 */
export async function pollForWorkflowEvents(chainId: number): Promise<WorkflowDataReceivedEvent[]> {
  const config = BRIDGE_EXECUTOR_CONFIG.chains[chainId];
  if (!config) {
    console.log(`[BridgeExecutor] Chain ${chainId} not configured, skipping`);
    return [];
  }

  const publicClient = getPublicClient(chainId);
  const currentBlock = await publicClient.getBlockNumber();

  // Get last checked block or use lookback
  let fromBlock = lastCheckedBlock.get(chainId);
  if (!fromBlock) {
    fromBlock =
      currentBlock > INITIAL_LOOKBACK_BLOCKS ? currentBlock - INITIAL_LOOKBACK_BLOCKS : 0n;
  }

  console.log(
    `[BridgeExecutor] Polling chain ${chainId} from block ${fromBlock} to ${currentBlock}`
  );

  const events: WorkflowDataReceivedEvent[] = [];

  // Poll each token address for events
  for (const tokenAddress of config.tokenAddresses) {
    if (tokenAddress === "0x0000000000000000000000000000000000000000") continue;

    try {
      const logs = await publicClient.getContractEvents({
        address: tokenAddress,
        abi: TOKEN_HYP_ERC20_ABI,
        eventName: "WorkflowDataReceived",
        fromBlock,
        toBlock: currentBlock,
      });

      for (const log of logs) {
        const event: WorkflowDataReceivedEvent = {
          messageId: log.args.messageId as `0x${string}`,
          recipient: log.args.recipient as `0x${string}`,
          amount: log.args.amount as bigint,
          workflowData: log.args.workflowData as `0x${string}`,
          blockNumber: log.blockNumber,
          transactionHash: log.transactionHash,
        };
        events.push(event);

        // Store as pending if not already processed
        const existingWorkflow = pendingWorkflows.get(event.messageId);
        if (!existingWorkflow) {
          pendingWorkflows.set(event.messageId, {
            messageId: event.messageId,
            recipient: event.recipient,
            amount: event.amount.toString(),
            workflowData: event.workflowData,
            tokenAddress,
            chainId,
            blockNumber: Number(event.blockNumber),
            transactionHash: event.transactionHash,
            status: "pending",
            createdAt: new Date(),
          });
          console.log(`[BridgeExecutor] New workflow detected: ${event.messageId}`);
        }
      }
    } catch (error) {
      console.error(`[BridgeExecutor] Error polling ${tokenAddress} on chain ${chainId}:`, error);
    }
  }

  // Update last checked block
  lastCheckedBlock.set(chainId, currentBlock + 1n);

  return events;
}

/**
 * Decode workflow data from bytes
 */
function decodeWorkflowData(workflowDataHex: `0x${string}`): WorkflowAction[] {
  try {
    // Decode the WorkflowData struct: (Action[] actions)
    // Action struct: (uint8 actionType, address targetContract, bytes data, uint256 inputAmountPercentage)
    const decoded = decodeAbiParameters(
      [
        {
          type: "tuple",
          components: [
            {
              name: "actions",
              type: "tuple[]",
              components: [
                { name: "actionType", type: "uint8" },
                { name: "targetContract", type: "address" },
                { name: "data", type: "bytes" },
                { name: "inputAmountPercentage", type: "uint256" },
              ],
            },
          ],
        },
      ],
      workflowDataHex
    );

    return decoded[0].actions as WorkflowAction[];
  } catch (error) {
    console.error("[BridgeExecutor] Failed to decode workflow data:", error);
    throw new Error("Failed to decode workflow data");
  }
}

/**
 * Execute a pending workflow
 */
export async function executeWorkflow(
  messageId: string
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  const workflow = pendingWorkflows.get(messageId);
  if (!workflow) {
    return { success: false, error: "Workflow not found" };
  }

  if (workflow.status !== "pending") {
    return { success: false, error: `Workflow already ${workflow.status}` };
  }

  const config = BRIDGE_EXECUTOR_CONFIG.chains[workflow.chainId];
  if (!config) {
    return { success: false, error: `Chain ${workflow.chainId} not configured` };
  }

  // Update status
  workflow.status = "executing";
  pendingWorkflows.set(messageId, workflow);

  try {
    const publicClient = getPublicClient(workflow.chainId);
    const walletClient = getWalletClient(workflow.chainId);
    const account = getExecutorAccount();

    // Decode workflow data
    const actions = decodeWorkflowData(
      workflow.workflowData as `0x${string}`
    ) as readonly WorkflowAction[];
    console.log(`[BridgeExecutor] Executing workflow ${messageId} with ${actions.length} actions`);

    // Check token balance in MainController
    const tokenBalance = await publicClient.readContract({
      address: workflow.tokenAddress as `0x${string}`,
      abi: TOKEN_HYP_ERC20_ABI,
      functionName: "balanceOf",
      args: [config.mainControllerAddress],
    });

    console.log(`[BridgeExecutor] MainController token balance: ${tokenBalance}`);

    if (tokenBalance < BigInt(workflow.amount)) {
      throw new Error(`Insufficient token balance: ${tokenBalance} < ${workflow.amount}`);
    }

    // Execute workflow via MainController
    // Use executeWorkflowWithReceivedTokens because tokens from bridge are already in MainController

    // DEBUG: Log actions before execution with detailed field info
    console.log(`[BridgeExecutor] Actions to execute (${actions.length} total):`);
    actions.forEach((action, idx) => {
      console.log(`  Action ${idx}:`, {
        actionType: action.actionType,
        targetContract: action.targetContract,
        data: action.data?.substring(0, 66) + "...", // Truncate for readability
        inputAmountPercentage: action.inputAmountPercentage?.toString(),
      });
    });

    // First, try to simulate the call to get detailed revert reason
    try {
      await publicClient.simulateContract({
        address: config.mainControllerAddress,
        abi: MAIN_CONTROLLER_ABI as any,
        functionName: "executeWorkflowWithReceivedTokens",
        args: [actions as any, workflow.tokenAddress as `0x${string}`, BigInt(workflow.amount)],
        account,
      } as any);
      console.log(`[BridgeExecutor] Simulation passed, proceeding with execution`);
    } catch (simulateError: any) {
      console.error(`[BridgeExecutor] Simulation failed with error:`, simulateError.message);
      // Extract revert reason if available
      if (simulateError.data) {
        console.error(`[BridgeExecutor] Contract error data:`, simulateError.data);
      }
      throw new Error(`Simulation failed: ${simulateError.message}`);
    }

    // Estimate gas dynamically with a safety margin
    // For Mantle L2, we MUST use the estimated gas - capping causes failures
    let gasLimit = MAX_GAS_LIMIT;
    let gasEstimationSucceeded = false;
    try {
      const estimatedGas = await publicClient.estimateContractGas({
        address: config.mainControllerAddress,
        abi: MAIN_CONTROLLER_ABI as any,
        functionName: "executeWorkflowWithReceivedTokens",
        args: [actions as any, workflow.tokenAddress as `0x${string}`, BigInt(workflow.amount)],
        account,
      } as any);
      // Add 20% safety margin - DO NOT CAP for L2 chains
      gasLimit = (estimatedGas * 120n) / 100n;
      gasEstimationSucceeded = true;
      console.log(`[BridgeExecutor] Estimated gas: ${estimatedGas}, using: ${gasLimit}`);
    } catch (estimateError) {
      console.warn(`[BridgeExecutor] Gas estimation failed, using MAX_GAS_LIMIT:`, estimateError);
    }

    // Only warn if using estimated gas significantly exceeds MAX (for logging purposes)
    if (gasEstimationSucceeded && gasLimit > MAX_GAS_LIMIT) {
      console.warn(
        `[BridgeExecutor] Using estimated gas ${gasLimit} (exceeds MAX_GAS_LIMIT ${MAX_GAS_LIMIT}) - required for L2 execution`
      );
    }

    const txHash = await walletClient.writeContract({
      address: config.mainControllerAddress,
      abi: MAIN_CONTROLLER_ABI as any,
      functionName: "executeWorkflowWithReceivedTokens",
      args: [actions as any, workflow.tokenAddress as `0x${string}`, BigInt(workflow.amount)],
      gas: gasLimit,
      account,
    } as any);

    console.log(`[BridgeExecutor] Workflow execution tx: ${txHash}`);

    // Wait for confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

    if (receipt.status === "success") {
      workflow.status = "completed";
      workflow.executionTxHash = txHash;
      workflow.executedAt = new Date();
      pendingWorkflows.set(messageId, workflow);
      return { success: true, txHash };
    } else {
      throw new Error("Transaction reverted");
    }
  } catch (error) {
    console.error(`[BridgeExecutor] Workflow execution failed:`, error);
    workflow.status = "failed";
    workflow.error = error instanceof Error ? error.message : String(error);
    pendingWorkflows.set(messageId, workflow);
    return { success: false, error: workflow.error };
  }
}

/**
 * Get pending workflows
 */
export function getPendingWorkflows(): PendingWorkflow[] {
  return Array.from(pendingWorkflows.values()).filter((w) => w.status === "pending");
}

/**
 * Get workflow by messageId
 */
export function getWorkflow(messageId: string): PendingWorkflow | undefined {
  return pendingWorkflows.get(messageId);
}

/**
 * Get all workflows
 */
export function getAllWorkflows(): PendingWorkflow[] {
  return Array.from(pendingWorkflows.values());
}

/**
 * Automatically process all pending workflows
 */
export async function processAllPendingWorkflows(): Promise<{
  processed: number;
  succeeded: number;
  failed: number;
}> {
  const pending = getPendingWorkflows();
  let succeeded = 0;
  let failed = 0;

  for (const workflow of pending) {
    const result = await executeWorkflow(workflow.messageId);
    if (result.success) {
      succeeded++;
    } else {
      failed++;
    }
  }

  return { processed: pending.length, succeeded, failed };
}
