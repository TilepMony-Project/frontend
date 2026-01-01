"use client";

import { ToastType, showToast } from "@/utils/toast-utils";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import type { PropsWithChildren, ReactNode } from "react";
import { useEffect, useState } from "react";

type WalletGuardProps = PropsWithChildren<{
  fallback?: ReactNode;
}>;

const defaultFallback = (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    <p className="text-base text-gray-600 dark:text-gray-400">Checking account connection...</p>
  </div>
);

export function WalletGuard({ children, fallback = defaultFallback }: WalletGuardProps) {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const [hasWarned, setHasWarned] = useState(false);

  const hasWallet = wallets.length > 0;
  const isProvisioningWallet = ready && authenticated && !hasWallet;
  const showFallback = !ready || isProvisioningWallet || !authenticated;

  useEffect(() => {
    if (ready && !authenticated && !hasWarned) {
      showToast({
        title: "Session expired",
        subtitle: "Redirecting to home...",
        variant: ToastType.INFO,
      });
      setHasWarned(true);
      router.replace("/");
    }
  }, [ready, authenticated, router, hasWarned]);

  if (showFallback) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
