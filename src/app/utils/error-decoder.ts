/**
 * Error Decoder Utility
 * Maps contract revert reasons to user-friendly messages
 */

// Common error signatures from MainController and adapters
const ERROR_MESSAGES: Record<string, string> = {
  // MainController errors
  "InsufficientBalance()": "Your wallet doesn't have enough tokens for this action.",
  "InvalidToken()": "The selected token is not supported.",
  "InvalidAdapter()": "The selected adapter is not registered.",
  "ActionFailed()": "One of the workflow actions failed to execute.",
  "Unauthorized()": "You don't have permission to perform this action.",
  "ZeroAmount()": "The amount cannot be zero.",

  // Swap errors
  "SlippageExceeded()": "Price moved too much. Try increasing slippage tolerance.",
  "InsufficientLiquidity()": "Not enough liquidity in the pool for this swap.",

  // Yield errors
  "DepositFailed()": "Failed to deposit into the yield vault.",
  "WithdrawFailed()": "Failed to withdraw from the yield vault.",
  "InsufficientShares()": "You don't have enough share tokens to withdraw.",

  // ERC20 errors
  "ERC20InsufficientBalance(address,uint256,uint256)": "Insufficient token balance in your wallet.",
  "ERC20InsufficientAllowance(address,uint256,uint256)":
    "Token approval is insufficient. Please approve more tokens.",

  // Generic
  "execution reverted": "Transaction was reverted by the contract.",
  "user rejected": "You cancelled the transaction.",
  "gas required exceeds": "Transaction would fail. Check your inputs and balances.",
};

/**
 * Extracts the error selector (first 4 bytes) from error data
 */
function extractErrorSelector(data: string): string | null {
  if (!data || data.length < 10) return null;
  return data.slice(0, 10); // 0x + 8 hex chars
}

/**
 * Decodes contract errors into user-friendly messages
 */
export function decodeContractError(error: unknown): string {
  if (!error) return "An unknown error occurred.";

  // Handle viem/wagmi error structure
  const err = error as any;
  const message = err?.message || err?.reason || err?.shortMessage || String(error);

  // Check for user rejection first
  if (
    message.toLowerCase().includes("user rejected") ||
    message.toLowerCase().includes("user denied")
  ) {
    return "You cancelled the transaction.";
  }

  // Check for gas estimation failure
  if (
    message.toLowerCase().includes("gas required exceeds") ||
    message.toLowerCase().includes("out of gas")
  ) {
    return "Transaction would fail. Please check your token balances and approvals.";
  }

  // Try to match known error patterns
  for (const [pattern, friendly] of Object.entries(ERROR_MESSAGES)) {
    if (message.includes(pattern)) {
      return friendly;
    }
  }

  // Try to extract revert reason from nested error
  const revertReason = err?.cause?.reason || err?.data?.message || err?.error?.message;

  if (revertReason) {
    for (const [pattern, friendly] of Object.entries(ERROR_MESSAGES)) {
      if (revertReason.includes(pattern)) {
        return friendly;
      }
    }

    // Return the raw revert reason if no mapping found
    if (revertReason.length < 200) {
      return `Contract error: ${revertReason}`;
    }
  }

  // If message is short enough, return it directly
  if (message.length < 150 && !message.includes("0x")) {
    return message;
  }

  // Fallback for unrecognized errors
  return "Transaction failed. Please check your inputs and try again.";
}

/**
 * Status message mapping for UI display
 */
export const STATUS_LABELS: Record<string, string> = {
  idle: "Ready",
  preparing: "Preparing workflow...",
  "checking-approval": "Checking token approval...",
  "signing-approval": "Please sign approval in your wallet",
  "processing-approval": "Confirming approval...",
  "estimating-gas": "Estimating gas cost...",
  "signing-execution": "Please sign transaction in your wallet",
  "processing-execution": "Confirming transaction...",
  success: "Workflow completed successfully!",
  error: "Execution failed",
};

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: string): string {
  return STATUS_LABELS[status] || status;
}
