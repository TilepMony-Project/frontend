"use client";

import { useRouter } from "next/navigation";
import type { PropsWithChildren, ReactNode } from "react";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { showToast, ToastType } from "@/utils/toast-utils";

type WalletGuardProps = PropsWithChildren<{
  fallback?: ReactNode;
}>;

const defaultFallback = (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    <p className="text-base text-gray-600 dark:text-gray-400">Checking wallet connection…</p>
  </div>
);

export function WalletGuard({ children, fallback = defaultFallback }: WalletGuardProps) {
  const router = useRouter();
  const { isConnected, isConnecting } = useAccount();
  const [isInitialized, setIsInitialized] = useState(false);

  // Track when wallet initialization is complete
  useEffect(() => {
    if (!isConnecting) {
      setIsInitialized(true);
    }
  }, [isConnecting]);

  // Only redirect after initialization is complete
  useEffect(() => {
    if (isInitialized && !isConnected && !isConnecting) {
      showToast({
        title: "Wallet disconnected",
        subtitle: "Redirecting to home...",
        variant: ToastType.INFO,
      });
      router.replace("/");
    }
  }, [isInitialized, isConnected, isConnecting, router]);

  // Show loading during initialization or while connecting
  if (!isInitialized || isConnecting) {
    return <>{fallback}</>;
  }

  // Show loading if not connected (before redirect happens)
  if (!isConnected) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
