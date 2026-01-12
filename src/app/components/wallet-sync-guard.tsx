"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

/**
 * Component that monitors wallet sync state between Privy and Wagmi.
 * If a mismatch is detected after auto-reconnect, it automatically logs out
 * and prompts the user to reconnect for better UX.
 */
export function WalletSyncGuard() {
  const { ready, authenticated, user, logout, login } = usePrivy();
  const { wallets } = useWallets();
  const {
    address: wagmiAddress,
    isConnected: isWagmiConnected,
    status: wagmiStatus,
  } = useAccount();
  const hasHandledMismatch = useRef(false);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Reset mismatch flag when user logs out
    if (!authenticated) {
      hasHandledMismatch.current = false;
      return;
    }

    // Only check when both Privy and Wagmi are ready
    if (!ready || !authenticated || !user?.wallet?.address) {
      return;
    }

    // Wait for Wagmi to stabilize (give it some time to sync)
    if (wagmiStatus === "connecting" || wagmiStatus === "reconnecting") {
      return;
    }

    // Clear any pending timeout
    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    // Delay the check to allow Wagmi to fully sync
    checkTimeoutRef.current = setTimeout(async () => {
      const privyAddress = user.wallet?.address || wallets[0]?.address;

      if (!privyAddress) return;

      // Check if Wagmi is connected but with different address
      if (isWagmiConnected && wagmiAddress && wagmiStatus === "connected") {
        const addressMismatch = wagmiAddress.toLowerCase() !== privyAddress.toLowerCase();

        if (addressMismatch && !hasHandledMismatch.current) {
          hasHandledMismatch.current = true;

          console.warn(
            `[WalletSyncGuard] Address mismatch detected. Privy: ${privyAddress}, Wagmi: ${wagmiAddress}`
          );

          // Auto logout and show toast with reconnect button
          await logout();

          toast.error("Wallet session expired", {
            description: "Please reconnect your wallet to continue.",
            duration: 10000,
            action: {
              label: "Reconnect",
              onClick: () => login(),
            },
          });
        }
      }

      // Check if Wagmi failed to connect after Privy auth
      if (!isWagmiConnected && wagmiStatus === "disconnected" && !hasHandledMismatch.current) {
        // Give extra time for slow connections
        const extendedCheck = setTimeout(async () => {
          if (!isWagmiConnected && wagmiStatus === "disconnected" && !hasHandledMismatch.current) {
            hasHandledMismatch.current = true;

            console.warn("[WalletSyncGuard] Wagmi failed to sync after Privy auth");

            await logout();

            toast.error("Wallet connection failed", {
              description: "Your session could not be restored. Please reconnect.",
              duration: 10000,
              action: {
                label: "Reconnect",
                onClick: () => login(),
              },
            });
          }
        }, 3000); // Wait 3 more seconds

        return () => clearTimeout(extendedCheck);
      }
    }, 2000); // Initial 2 second delay for Wagmi to sync

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [
    ready,
    authenticated,
    user,
    wallets,
    wagmiAddress,
    isWagmiConnected,
    wagmiStatus,
    logout,
    login,
  ]);

  return null;
}
