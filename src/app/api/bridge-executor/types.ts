// Types for Bridge Executor Service
export interface WorkflowAction {
  actionType: number;
  targetContract: `0x${string}`;
  data: `0x${string}`;
  inputAmountPercentage: bigint;
}

export interface WorkflowDataReceivedEvent {
  messageId: `0x${string}`;
  recipient: `0x${string}`;
  amount: bigint;
  workflowData: `0x${string}`;
  blockNumber: bigint;
  transactionHash: `0x${string}`;
}

export interface PendingWorkflow {
  messageId: string;
  recipient: string;
  amount: string;
  workflowData: string;
  tokenAddress: string;
  chainId: number;
  blockNumber: number;
  transactionHash: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  executionTxHash?: string;
  error?: string;
  createdAt: Date;
  executedAt?: Date;
}

export interface BridgeExecutorConfig {
  chains: {
    [chainId: number]: {
      name: string;
      rpcUrl: string;
      tokenAddresses: `0x${string}`[];
      mainControllerAddress: `0x${string}`;
      pollIntervalMs: number;
    };
  };
}

export interface ExecuteWorkflowRequest {
  messageId: string;
  chainId: number;
}

export interface WorkflowStatus {
  messageId: string;
  status: PendingWorkflow['status'];
  executionTxHash?: string;
  error?: string;
}
