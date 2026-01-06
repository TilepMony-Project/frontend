/**
 * MainController Action Encoding Utilities
 * Used to construct Action structs for executeWorkflow calls
 */

import { type Hex, encodeAbiParameters, parseAbiParameters } from "viem";

// Action Type Enum (matches smart contract)
export const ActionType = {
  SWAP: 0,
  YIELD: 1,
  BRIDGE: 2,
  TRANSFER: 3,
  MINT: 4,
  YIELD_WITHDRAW: 5,
} as const;

export type ActionTypeValue = (typeof ActionType)[keyof typeof ActionType];

// Action Interface (matches smart contract struct)
export interface Action {
  readonly actionType: number;
  readonly targetContract: `0x${string}`;
  readonly data: Hex;
  readonly inputAmountPercentage: bigint;
}

/**
 * Encode SWAP action data
 * @param adapter - Swap adapter address (FusionX, MerchantMoe, Vertex)
 * @param tokenIn - Input token address (use 0x0 for dynamic from previous action)
 * @param tokenOut - Output token address
 * @param amountIn - Amount to swap (ignored, uses inputAmountPercentage)
 * @param minAmountOut - Minimum output amount (slippage protection)
 * @param to - Recipient address (use 0x0 to keep in MainController)
 */
export const encodeSwapData = (
  adapter: string,
  tokenIn: string,
  tokenOut: string,
  amountIn: bigint,
  minAmountOut: bigint,
  to: string
): Hex => {
  return encodeAbiParameters(
    parseAbiParameters(
      "address adapter, address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, address to"
    ),
    [
      adapter as `0x${string}`,
      tokenIn as `0x${string}`,
      tokenOut as `0x${string}`,
      amountIn,
      minAmountOut,
      to as `0x${string}`,
    ]
  );
};

/**
 * Encode YIELD (deposit) action data
 * @param adapter - Yield adapter address (MethLab, InitCapital, Compound)
 * @param token - Token to deposit (use 0x0 for dynamic from previous action)
 * @param amount - Amount to deposit (ignored, uses inputAmountPercentage)
 * @param adapterData - Additional adapter-specific data (usually empty "0x")
 */
export const encodeYieldDepositData = (
  adapter: string,
  token: string,
  amount: bigint,
  adapterData: Hex = "0x"
): Hex => {
  return encodeAbiParameters(
    parseAbiParameters("address adapter, address token, uint256 amount, bytes adapterData"),
    [adapter as `0x${string}`, token as `0x${string}`, amount, adapterData]
  );
};

/**
 * Encode YIELD_WITHDRAW action data
 * @param adapter - Yield adapter address
 * @param shareToken - Share token address (use 0x0 for dynamic from previous action)
 * @param underlyingToken - The underlying token to receive
 * @param amount - Amount of shares to withdraw (ignored, uses inputAmountPercentage)
 * @param adapterData - Additional adapter-specific data (usually empty "0x")
 */
export const encodeYieldWithdrawData = (
  adapter: string,
  shareToken: string,
  underlyingToken: string,
  amount: bigint,
  adapterData: Hex = "0x"
): Hex => {
  return encodeAbiParameters(
    parseAbiParameters(
      "address adapter, address shareToken, address underlyingToken, uint256 amount, bytes adapterData"
    ),
    [
      adapter as `0x${string}`,
      shareToken as `0x${string}`,
      underlyingToken as `0x${string}`,
      amount,
      adapterData,
    ]
  );
};

/**
 * Encode TRANSFER action data
 * @param token - Token to transfer (use 0x0 for dynamic from previous action)
 */
export const encodeTransferData = (token: string): Hex => {
  return encodeAbiParameters(parseAbiParameters("address token"), [token as `0x${string}`]);
};

/**
 * Encode MINT action data
 * @param token - Token to mint (IDRX, USDC, USDT)
 * @param amount - Amount to mint (this IS used, unlike other actions)
 */
export const encodeMintData = (token: string, amount: bigint): Hex => {
  return encodeAbiParameters(parseAbiParameters("address token, uint256 amount"), [
    token as `0x${string}`,
    amount,
  ]);
};

/**
 * Zero address constant for dynamic token resolution
 */
export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as const;

/**
 * Helper to check if address is zero (dynamic token)
 */
export const isDynamicToken = (address: string): boolean => {
  return (
    address.toLowerCase() === ZERO_ADDRESS.toLowerCase() || address === "" || address === "0x0"
  );
};

/**
 * Encode BRIDGE action data
 * Matches MainController: (address token, uint32 destination, bytes32 recipient, bytes additionalData)
 * @param token - Token to bridge (use 0x0 for dynamic from previous action)
 * @param destination - Destination chain ID (uint32)
 * @param recipient - Recipient address on destination chain (converted to bytes32)
 * @param additionalData - Encoded Chain B workflow data
 */
export const encodeBridgeData = (
  token: string,
  destination: number,
  recipient: string,
  additionalData: Hex = "0x"
): Hex => {
  // Convert recipient address to bytes32 (left-padded with zeros)
  const recipientBytes32 = ("0x" + recipient.slice(2).padStart(64, "0")) as `0x${string}`;

  return encodeAbiParameters(
    parseAbiParameters("address token, uint32 destination, bytes32 recipient, bytes additionalData"),
    [token as `0x${string}`, destination, recipientBytes32, additionalData]
  );
};

/**
 * WORKFLOW_ID = keccak256(abi.encodePacked("WORKFLOW"))
 * Used to identify workflow data in cross-chain messages
 */
const WORKFLOW_ID = "0xca5c284a0aa1c6618e287ec3266b1e676f808351b35a5133f9869ff0bc3921d7" as const;

/**
 * Encode Chain B actions into additionalData format for TokenHypERC20
 * 
 * Matches Solidity encoding:
 *   bytes32 workflowId = keccak256(abi.encodePacked("WORKFLOW"));
 *   TokenHypERC20.WorkflowData memory workflowData = TokenHypERC20.WorkflowData({actions: actions});
 *   return abi.encodePacked(workflowId, abi.encode(workflowData));
 * 
 * @param actions - Array of Action objects for Chain B execution
 * @returns Hex encoded workflow data
 */
export const encodeChainBWorkflow = (actions: Action[]): Hex => {
  // Convert actions to TokenHypERC20.Action format
  const workflowActions = actions.map((a) => ({
    actionType: a.actionType,
    target: a.targetContract,
    data: a.data,
    inputAmountPercentage: a.inputAmountPercentage,
  }));

  // abi.encode(WorkflowData) where WorkflowData = { actions: Action[] }
  const encodedWorkflowData = encodeAbiParameters(
    [
      {
        type: "tuple",
        components: [
          {
            name: "actions",
            type: "tuple[]",
            components: [
              { name: "actionType", type: "uint8" },
              { name: "target", type: "address" },
              { name: "data", type: "bytes" },
              { name: "inputAmountPercentage", type: "uint256" },
            ],
          },
        ],
      },
    ],
    [{ actions: workflowActions }]
  );

  // abi.encodePacked(workflowId, abi.encode(workflowData))
  // = simple concatenation: WORKFLOW_ID (32 bytes) + encodedWorkflowData
  return (WORKFLOW_ID + encodedWorkflowData.slice(2)) as Hex;
};
