import { parseAbi } from 'viem';
import type { BridgeExecutorConfig } from './types';

// TokenHypERC20 ABI subset for event parsing and execution
export const TOKEN_HYP_ERC20_ABI = parseAbi([
  'event WorkflowDataReceived(bytes32 indexed messageId, bytes32 indexed recipient, uint256 amount, bytes workflowData)',
  'event WorkflowExecuted(bytes32 indexed messageId, address indexed workflowExecutor, uint256 indexed amount, bool success)',
  'function autoExecuteWorkflow() view returns (bool)',
  'function workflowExecutor() view returns (address)',
  'function balanceOf(address account) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
]);

// MainController ABI subset
export const MAIN_CONTROLLER_ABI = parseAbi([
  // Use executeWorkflowWithReceivedTokens when tokens are already in MainController (from bridge)
  'function executeWorkflowWithReceivedTokens((uint8 actionType, address targetContract, bytes data, uint256 inputAmountPercentage)[] actions, address initialToken, uint256 initialAmount)',
  // Use executeWorkflow when backend wallet holds tokens and needs to transfer them
  'function executeWorkflow((uint8 actionType, address targetContract, bytes data, uint256 inputAmountPercentage)[] actions, address initialToken, uint256 initialAmount) payable',
  'event WorkflowExecuted(address indexed executor, uint256 actionCount)',
]);

// Chain configuration with actual deployed addresses
// These addresses are the same across chains due to CREATE2 deployment
export const BRIDGE_EXECUTOR_CONFIG: BridgeExecutorConfig = {
  chains: {
    // Mantle Sepolia
    5003: {
      name: 'Mantle Sepolia',
      rpcUrl: process.env.RPC_URL_MANTLE_SEPOLIA || 'https://rpc.sepolia.mantle.xyz',
      tokenAddresses: [
        '0x9C314942eAD675f56274da992aCCa6bCaA5d5147' as `0x${string}`, // IDRX
        '0xd0f6B4Ed0F01579DaC8870A8EDba81c3ae6e751f' as `0x${string}`, // USDC
        '0x72a9793834a41054216Dfaf8782A38044470f42F' as `0x${string}`, // USDT
      ],
      mainControllerAddress: '0xFE16617562Ce4005C42B0CDd70493820Ff0d8494' as `0x${string}`,
      pollIntervalMs: 5000,
    },
    // Base Sepolia
    84532: {
      name: 'Base Sepolia',
      rpcUrl: process.env.RPC_URL_BASE_SEPOLIA || 'https://sepolia.base.org',
      tokenAddresses: [
        '0x9C314942eAD675f56274da992aCCa6bCaA5d5147' as `0x${string}`, // IDRX
        '0xd0f6B4Ed0F01579DaC8870A8EDba81c3ae6e751f' as `0x${string}`, // USDC
        '0x72a9793834a41054216Dfaf8782A38044470f42F' as `0x${string}`, // USDT
      ],
      mainControllerAddress: '0xFE16617562Ce4005C42B0CDd70493820Ff0d8494' as `0x${string}`,
      pollIntervalMs: 5000,
    },
  },
};

// How far back to look for events on startup (in blocks)
export const INITIAL_LOOKBACK_BLOCKS = 1000n;

// Maximum gas for workflow execution
// Note: Mantle L2 has different gas mechanics - minimum ~71M for complex operations
export const MAX_GAS_LIMIT = 80_000_000n;
