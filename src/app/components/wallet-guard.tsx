'use client';

import { useRouter } from 'next/navigation';
import type { PropsWithChildren, ReactNode } from 'react';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

type WalletGuardProps = PropsWithChildren<{
  fallback?: ReactNode;
}>;

const defaultFallback = (
  <div className="flex flex-col items-center justify-center min-h-screen gap-4">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    <p className="text-base text-gray-600 dark:text-gray-400">
      Checking wallet connection…
    </p>
  </div>
);

export function WalletGuard({ children, fallback = defaultFallback }: WalletGuardProps) {
  const router = useRouter();
  const { isConnected, isConnecting } = useAccount();

  useEffect(() => {
    if (!isConnected && !isConnecting) {
      router.replace('/');
    }
  }, [isConnected, isConnecting, router]);

  if (!isConnected) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
