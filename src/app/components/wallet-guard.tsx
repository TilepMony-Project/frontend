'use client';

import { useRouter } from 'next/navigation';
import type { PropsWithChildren, ReactNode } from 'react';
import { useEffect } from 'react';
import { useAccount } from 'wagmi';

type WalletGuardProps = PropsWithChildren<{
  fallback?: ReactNode;
}>;

const defaultFallback = (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      fontSize: '1rem',
      color: 'var(--ax-txt-secondary-default, #6c6c6c)',
    }}
  >
    Checking wallet connection…
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
