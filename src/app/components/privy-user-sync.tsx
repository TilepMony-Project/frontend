"use client";

import { useEffect, useRef } from "react";
import { usePrivy, useWallets } from "@privy-io/react-auth";

export function PrivyUserSync() {
  const { ready, authenticated, user, getAccessToken } = usePrivy();
  const { wallets } = useWallets();
  const lastSyncedSnapshot = useRef<string | null>(null);

  useEffect(() => {
    if (!ready || !authenticated || !user) {
      return;
    }

    const primaryWallet = wallets[0]?.address || user.wallet?.address || null;
    const emailAddress = user.email?.address || null;

    const syncPayload = {
      privyUserId: user.id,
      email: emailAddress,
      walletAddress: primaryWallet,
      privyUser: user,
    };

    const maybeUserMetadata = user as unknown as {
      updatedAt?: string | Date | null;
      createdAt?: string | Date | null;
    };
    const updatedAtSource = maybeUserMetadata.updatedAt ?? maybeUserMetadata.createdAt ?? null;
    const normalizedUpdatedAt =
      updatedAtSource instanceof Date ? updatedAtSource.toISOString() : updatedAtSource;

    const payloadSignature = JSON.stringify({
      id: syncPayload.privyUserId,
      email: syncPayload.email,
      wallet: syncPayload.walletAddress,
      updatedAt: normalizedUpdatedAt,
    });

    if (lastSyncedSnapshot.current === payloadSignature) {
      return;
    }

    lastSyncedSnapshot.current = payloadSignature;

    (async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          throw new Error("Missing Privy access token");
        }
        await fetch("/api/users/sync", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(syncPayload),
        });
      } catch (error) {
        console.error("Failed to sync Privy user", error);
        lastSyncedSnapshot.current = null;
      }
    })();
  }, [ready, authenticated, user, wallets, getAccessToken]);

  return null;
}
