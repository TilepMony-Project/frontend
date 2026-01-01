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
